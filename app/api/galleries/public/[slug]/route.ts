import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/galleries/public/[slug]
 * Public gallery landing page data (NO auth)
 */
/**
 * @swagger
 * /api/galleries/public/{slug}:
 *   get:
 *     summary: Public guest gallery landing page
 *     description: |
 *       Retrieves gallery meta-information and labeled face clusters for guest viewing. 
 *       Supports password protection. Omitted from standard authentication.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: password
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gallery public data
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GalleryPublic' }
 *       401:
 *         description: Password required or invalid
 *       403:
 *         description: Gallery not yet published
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password');

    // 1. Fetch Gallery
    const { data: gallery, error } = await supabase
      .from('galleries')
      .select(`
        *,
        studio:studios(name, logo_url)
      `)
      .eq('slug', params.slug)
      .is('deleted_at', null)
      .single();

    if (error || !gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    if (!gallery.is_published) return NextResponse.json({ error: 'Gallery is not yet published' }, { status: 403 });
    if (new Date(gallery.expires_at) < new Date()) return NextResponse.json({ error: 'Gallery has expired' }, { status: 410 });

    // 2. Auth check (Password)
    if (gallery.password) {
        if (!password) return NextResponse.json({ requires_password: true }, { status: 401 });
        // In real app, use bcrypt or crypto.timingSafeEqual
        if (password !== gallery.password) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 3. Log view and increment
    await supabase.from('gallery_share_logs').insert({
        gallery_id: gallery.id,
        event_type: 'view',
        ip_address: req.headers.get('x-forwarded-for') || req.ip || 'unknown'
    });
    
    await supabase.rpc('increment_gallery_views', { g_id: gallery.id });

    // 4. Return safe data
    const { data: labels } = await supabase.from('face_clusters').select('label, photo_count').eq('gallery_id', gallery.id).is('is_labeled', true);

    return NextResponse.json({
        data: {
            studio_name: gallery.studio.name,
            studio_logo: gallery.studio.logo_url,
            event_type: gallery.event_type,
            event_date: gallery.event_date,
            total_photos: gallery.total_photos,
            labeled_clusters: labels || [],
            is_download_enabled: gallery.is_download_enabled,
            has_universal_qr: !!gallery.universal_qr_url
        }
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
