import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/galleries/{id}/publish:
 *   post:
 *     summary: Publish gallery to guest access
 *     description: |
 *       Marks the gallery as live and triggers automated notifications to the client. 
 *       Updates lead and booking status to 'delivered'.
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
 *         description: Gallery published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 gallery_url: { type: string, format: uri }
 *                 access_token: { type: string }
 *       422:
 *         description: Cannot publish empty gallery
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    // 1. Validate requirements
    const { data: gallery, error: gErr } = await supabase
        .from('galleries')
        .select('*, booking_id')
        .eq('id', params.id)
        .single();
    
    if (gErr || !gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    if (gallery.total_photos === 0) return NextResponse.json({ error: 'Cannot publish empty gallery' }, { status: 422 });

    // 2. Update Statuses
    await supabase.from('galleries').update({
        is_published: true,
        published_at: new Date().toISOString(),
        status: 'published'
    }).eq('id', params.id);

    await supabase.from('bookings').update({ status: 'delivered' }).eq('id', gallery.booking_id);
    await supabase.from('leads').update({ status: 'delivered' }).eq('booking_id', gallery.booking_id);

    // 3. Log Activity
    await supabase.from('booking_activity_feed').insert({
        booking_id: gallery.booking_id,
        studio_id: member.studio_id,
        activity_type: 'gallery_published',
        metadata: { gallery_id: gallery.id }
    });

    // 4. Trigger Automation
    await supabase.from('automation_log').insert({
        studio_id: member.studio_id,
        booking_id: gallery.booking_id,
        automation_type: 'gallery_ready',
        scheduled_for: new Date().toISOString(),
        metadata: { 
            gallery_id: gallery.id,
            gallery_slug: gallery.slug,
            access_token: gallery.access_token
        }
    });

    return NextResponse.json({ 
        success: true, 
        gallery_url: `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}`,
        access_token: gallery.access_token 
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Publish gallery failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
