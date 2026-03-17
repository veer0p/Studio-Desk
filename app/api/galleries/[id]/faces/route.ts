import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { immichClient } from '@/lib/immich/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSecureToken } from '@/lib/crypto';
import { logError } from '@/lib/logger';

/**
 * @swagger
 * /api/galleries/{id}/faces:
 *   get:
 *     summary: List face clusters for a gallery
 *     description: |
 *       Retrieves all detected face clusters synced from Immich. 
 *       Includes ML processing status from Immich.
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
 *         description: List of face clusters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clusters: { type: array, items: { $ref: '#/components/schemas/FaceCluster' } }
 *                 ml_processing: { type: boolean }
 *                 unlabeled_count: { type: integer }
 *                 labeled_count: { type: integer }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    
    // 1. Fetch from DB
    const { data: clusters, error } = await supabase
      .from('face_clusters')
      .select('*')
      .eq('gallery_id', params.id)
      .order('photo_count', { ascending: false });

    if (error) throw error;

    // 2. Check ML processing status
    const { mlClassifier } = await immichClient.getJobStatus();
    const isProcessing = mlClassifier.jobCounts.active > 0 || mlClassifier.jobCounts.waiting > 0;

    return NextResponse.json({
        clusters,
        ml_processing: isProcessing,
        unlabeled_count: clusters.filter(c => !c.is_labeled).length,
        labeled_count: clusters.filter(c => c.is_labeled).length
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/galleries/{id}/faces:
 *   post:
 *     summary: Re-sync face clusters from Immich
 *     description: |
 *       Manually triggers a pull of all detected persons from the dedicated Immich library.
 *       New persons are added as unlabeled face clusters.
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
 *         description: Face clusters synced successfully
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    
    const { data: gallery } = await supabase.from('galleries').select('immich_library_id').eq('id', params.id).single();
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });

    // 1. Fetch people from Immich
    const persons = await immichClient.getPersons(gallery.immich_library_id);

    // 2. Sync to DB
    const syncResults = await Promise.all(persons.map(async (person) => {
        const { data: existing } = await supabase
            .from('face_clusters')
            .select('id, label, is_labeled')
            .eq('immich_person_id', person.id)
            .maybeSingle();
        
        const clusterData = {
            studio_id: member.studio_id,
            gallery_id: params.id,
            immich_person_id: person.id,
            photo_count: person.numberOfAssets,
            representative_photo_url: `${process.env.IMMICH_BASE_URL}/${person.thumbnailPath}`,
            qr_access_token: existing?.qr_access_token || generateSecureToken()
        };

        if (existing) {
            return supabase.from('face_clusters').update(clusterData).eq('id', existing.id);
        } else {
            return supabase.from('face_clusters').insert({
                ...clusterData,
                label: person.name || 'Unlabeled Cluster',
                is_labeled: !!person.name
            });
        }
    }));

    return NextResponse.json({ success: true, count: persons.length });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    await logError({ message: 'Sync faces failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
