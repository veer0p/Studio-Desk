import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { updateGallerySchema } from '@/lib/validations/gallery';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/galleries/{id}:
 *   get:
 *     summary: Get gallery details and face stats
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Gallery details with face cluster statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Gallery'
 *                     - type: object
 *                       properties:
 *                         face_stats:
 *                            type: object
 *                            properties:
 *                              unlabeled: { type: integer }
 *                              labeled: { type: integer }
 *       404:
 *         description: Gallery not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data, error } = await supabase
      .from('galleries')
      .select(`
        *,
        booking:bookings(*),
        videos:gallery_videos(*)
      `)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });

    const { count: unlabeled } = await supabase.from('face_clusters').select('*', { count: 'exact', head: true }).eq('gallery_id', params.id).eq('is_labeled', false);
    const { count: labeled } = await supabase.from('face_clusters').select('*', { count: 'exact', head: true }).eq('gallery_id', params.id).eq('is_labeled', true);

    return NextResponse.json({ 
      data: { 
        ...data, 
        face_stats: { unlabeled, labeled } 
      } 
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/galleries/{id}:
 *   patch:
 *     summary: Update gallery settings
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GalleryUpdate' }
 *     responses:
 *       200:
 *         description: Gallery updated
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = updateGallerySchema.parse(body);

    const { data, error } = await supabase
      .from('galleries')
      .update(validated)
      .eq('id', params.id)
      .eq('studio_id', member.studio_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/galleries/{id}:
 *   delete:
 *     summary: Soft-delete/Archive gallery
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Gallery archived
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { error } = await supabase
      .from('galleries')
      .update({ deleted_at: new Date().toISOString(), status: 'archived' })
      .eq('id', params.id)
      .eq('studio_id', member.studio_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
