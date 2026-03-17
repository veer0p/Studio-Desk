import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createGallerySchema } from '@/lib/validations/gallery';
import { immichClient } from '@/lib/immich/client';
import { logError } from '@/lib/logger';
import { generateSecureToken } from '@/lib/crypto';
import { formatIndianDate } from '@/lib/formatters';

/**
 * @swagger
 * /api/galleries:
 *   get:
 *     summary: List and search galleries
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: booking_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [processing, live, archived] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of galleries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Gallery' } }
 *                 count: { type: integer }
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const bookingId = searchParams.get('booking_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('galleries')
      .select(`
        *,
        booking:bookings(title, event_date, client:clients(full_name))
      `, { count: 'exact' })
      .eq('studio_id', member.studio_id)
      .order('created_at', { ascending: false });

    if (bookingId) query = query.eq('booking_id', bookingId);
    if (status) query = query.eq('status', status);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).is('deleted_at', null);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
        data,
        count: count || 0,
        page,
        pageSize: limit
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/galleries:
 *   post:
 *     summary: Create new AI gallery
 *     description: |
 *       Initializes a gallery for a booking. 
 *       Automatically creates a dedicated Immich library and album for the studio/event.
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GalleryCreate' }
 *     responses:
 *       201:
 *         description: Gallery created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Gallery' }
 *       409:
 *         description: Gallery already exists for this booking
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = createGallerySchema.parse(body);

    // 1. Validate booking
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('*, studio:studios(*)')
      .eq('id', validated.booking_id)
      .eq('studio_id', member.studio_id)
      .single();

    if (bErr || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    // 2. Check existing
    const { count } = await supabase
        .from('galleries')
        .select('*', { count: 'exact', head: true })
        .eq('booking_id', booking.id)
        .is('deleted_at', null);
    
    if (count && count > 0) return NextResponse.json({ error: 'Gallery already exists for this booking' }, { status: 409 });

    // 3. Get or Create Studio Immich Library
    const libName = `studio-${member.studio_id}`;
    const libraries = await immichClient.getLibraries();
    let library = libraries.find(l => l.name === libName);

    if (!library) {
        library = await immichClient.createLibrary(libName);
    }

    // 4. Create Immich Album
    const albumName = `${booking.title} - ${formatIndianDate(booking.event_date)}`;
    const album = await immichClient.createAlbum(albumName);

    // 5. Create Gallery Record
    const slug = `${booking.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${generateSecureToken(4)}`;
    const { data: gallery, error: gErr } = await supabase
      .from('galleries')
      .insert({
        studio_id: member.studio_id,
        booking_id: booking.id,
        immich_library_id: library.id,
        immich_album_id: album.id,
        status: 'processing',
        slug,
        access_token: generateSecureToken(),
        expires_at: validated.expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        watermark_settings: booking.studio.gallery_settings?.watermark || {}
      })
      .select()
      .single();

    if (gErr) throw gErr;

    return NextResponse.json({ data: gallery });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Create gallery failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
