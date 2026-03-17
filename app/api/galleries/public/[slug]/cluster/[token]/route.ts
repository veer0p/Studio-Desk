import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { immichClient } from '@/lib/immich/client';
import { getSignedThumbnailUrl, getSignedDownloadUrl } from '@/lib/immich/proxy';

/**
 * GET /api/galleries/public/[slug]/cluster/[token]
 */
/**
 * @swagger
 * /api/galleries/public/{slug}/cluster/{token}:
 *   get:
 *     summary: View private face-matched gallery
 *     description: |
 *       Retrieves photos belonging to a specific face cluster (guest portal). 
 *       Returns signed thumbnail and download URLs via Immich proxy.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: token
 *         required: true
 *         description: QR access token
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Paginated photos for the cluster
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string, token: string } }
) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 1. Validate Token and Slug
    const { data: cluster, error } = await supabase
      .from('face_clusters')
      .select('*, gallery:galleries(*)')
      .eq('qr_access_token', params.token)
      .single();

    if (error || !cluster || (cluster.gallery as any).slug !== params.slug) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const gallery = cluster.gallery as any;
    if (!gallery.is_published) return NextResponse.json({ error: 'Gallery not published' }, { status: 403 });
    if (new Date(gallery.expires_at) < new Date()) return NextResponse.json({ error: 'Gallery expired' }, { status: 410 });

    // 2. Fetch from Immich
    const allAssets = await immichClient.getPersonAssets(cluster.immich_person_id);
    const startIndex = (page - 1) * limit;
    const paginatedAssets = allAssets.slice(startIndex, startIndex + limit);

    const photos = paginatedAssets.map(asset => ({
        id: asset.id,
        thumbnail_url: getSignedThumbnailUrl(asset.id, gallery.studio_id),
        download_url: gallery.is_download_enabled ? getSignedDownloadUrl(asset.id, gallery.studio_id) : null,
        taken_at: asset.exifInfo?.dateTimeOriginal || asset.localDateTime,
        dimensions: { width: asset.exifInfo?.width, height: asset.exifInfo?.height }
    }));

    return NextResponse.json({
        data: {
            cluster_label: cluster.label,
            photos,
            total_photos: allAssets.length,
            page,
            pageSize: limit
        }
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
