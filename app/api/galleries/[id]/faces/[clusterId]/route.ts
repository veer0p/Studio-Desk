import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { labelClusterSchema } from '@/lib/validations/gallery';
import { immichClient } from '@/lib/immich/client';
import { generateQRCode, uploadQRToStorage } from '@/lib/qr/generator';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/galleries/{id}/faces/{clusterId}:
 *   get:
 *     summary: Get face cluster details
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clusterId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Face cluster details
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/FaceCluster' }
 *       404:
 *         description: Not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string, clusterId: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { data: cluster, error } = await supabase
      .from('face_clusters')
      .select('*')
      .eq('id', params.clusterId)
      .eq('gallery_id', params.id)
      .single();

    if (error || !cluster) return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });

    // Immich doesn't easily return "sample" assets for a person in one go with thumbnails, 
    // usually we just use the representative thumbnail or fetch first page of assets.
    return NextResponse.json({ data: cluster });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/galleries/{id}/faces/{clusterId}:
 *   patch:
 *     summary: Label a face cluster and generate QR
 *     description: |
 *       Assigns a name to the cluster in Immich and StudioDesk. 
 *       Automatically generates a public QR code for guest access.
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clusterId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LabelCluster' }
 *     responses:
 *       200:
 *         description: Cluster labeled and QR generated
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string, clusterId: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const { label } = labelClusterSchema.parse(body);

    // 1. Fetch cluster
    const { data: cluster } = await supabase
        .from('face_clusters')
        .select('*, gallery:galleries(slug)')
        .eq('id', params.clusterId)
        .single();
    
    if (!cluster) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Update Immich Person Name
    await immichClient.updatePerson(cluster.immich_person_id, label);

    // 3. Generate QR Code
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/${(cluster.gallery as any).slug}/cluster/${cluster.qr_access_token}`;
    const qrDataUrl = await generateQRCode(publicUrl);
    const storagePath = `qr/${member.studio_id}/${params.clusterId}.png`;
    const qrFileUrl = await uploadQRToStorage(qrDataUrl, storagePath);

    // 4. Update DB
    const { data, error } = await supabase
      .from('face_clusters')
      .update({
        label,
        is_labeled: true,
        qr_code_url: qrFileUrl,
        qr_generated_at: new Date().toISOString()
      })
      .eq('id', params.clusterId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Label cluster failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
