import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { generateQRCode, uploadQRToStorage } from '@/lib/qr/generator';

/**
 * @swagger
 * /api/galleries/{id}/qr:
 *   get:
 *     summary: Get all QR codes for a gallery
 *     description: Returns the universal lookup QR and all cluster-specific private QRs.
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
 *         description: QR urls and cluster tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clusters: { type: array, items: { $ref: '#/components/schemas/FaceCluster' } }
 *                 universal_event_qr: { type: string, format: uri }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    // 1. Fetch Clusters with QR
    const { data: clusters } = await supabase
        .from('face_clusters')
        .select('id, label, photo_count, qr_code_url, qr_access_token')
        .eq('gallery_id', params.id)
        .is('is_labeled', true);

    // 2. Fetch Universal QR
    const { data: gallery } = await supabase
        .from('galleries')
        .select('slug, universal_qr_url')
        .eq('id', params.id)
        .single();
    
    let universal_qr = gallery?.universal_qr_url;
    if (!universal_qr && gallery) {
        const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}/lookup`;
        const qrDataUrl = await generateQRCode(publicUrl);
        universal_qr = await uploadQRToStorage(qrDataUrl, `qr/${member.studio_id}/universal-${params.id}.png`);
        await supabase.from('galleries').update({ universal_qr_url: universal_qr }).eq('id', params.id);
    }

    return NextResponse.json({
        clusters,
        universal_event_qr: universal_qr
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/galleries/{id}/qr:
 *   post:
 *     summary: Bulk regenerate all QR codes
 *     description: Regenerates both the universal QR and all private cluster QRs.
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
 *         description: QRs regenerated successfully
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data: gallery } = await supabase.from('galleries').select('slug').eq('id', params.id).single();
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });

    // Regenerate Universal
    const lookupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}/lookup`;
    const universalDataUrl = await generateQRCode(lookupUrl);
    const universalFileUrl = await uploadQRToStorage(universalDataUrl, `qr/${member.studio_id}/universal-${params.id}.png`);
    await supabase.from('galleries').update({ universal_qr_url: universalFileUrl }).eq('id', params.id);

    // Regenerate Clusters
    const { data: clusters } = await supabase.from('face_clusters').select('*').eq('gallery_id', params.id).is('is_labeled', true);
    if (clusters) {
        await Promise.all(clusters.map(async (c) => {
            const clusterUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}/cluster/${c.qr_access_token}`;
            const qrDataUrl = await generateQRCode(clusterUrl);
            const qrFileUrl = await uploadQRToStorage(qrDataUrl, `qr/${member.studio_id}/${c.id}.png`);
            return supabase.from('face_clusters').update({ qr_code_url: qrFileUrl }).eq('id', c.id);
        }));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
