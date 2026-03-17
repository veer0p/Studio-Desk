import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { immichClient } from '@/lib/immich/client';
import { getSignedThumbnailUrl } from '@/lib/immich/proxy';

/**
 * GET /api/galleries/[id]/faces/[clusterId]/photos
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string, clusterId: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 1. Fetch Cluster
    const { data: cluster } = await supabase
        .from('face_clusters')
        .select('immich_person_id')
        .eq('id', params.clusterId)
        .single();
    
    if (!cluster) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Fetch from Immich
    const allAssets = await immichClient.getPersonAssets(cluster.immich_person_id);
    
    // Pagination (Immich API for person assets is usually non-paginated in standard personAssets call)
    const startIndex = (page - 1) * limit;
    const paginatedAssets = allAssets.slice(startIndex, startIndex + limit);

    const photos = paginatedAssets.map(asset => ({
        immich_asset_id: asset.id,
        filename: asset.originalFileName,
        thumbnail_url: getSignedThumbnailUrl(asset.id, member.studio_id),
        taken_at: asset.exifInfo?.dateTimeOriginal || asset.localDateTime,
        width: asset.exifInfo?.width,
        height: asset.exifInfo?.height
    }));

    return NextResponse.json({
        photos,
        total: allAssets.length,
        page,
        pageSize: limit
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
