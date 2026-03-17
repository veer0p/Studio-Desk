import { NextRequest, NextResponse } from 'next/server';
import { verifyAssetToken } from '@/lib/immich/proxy';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/immich/asset/[assetId]/download
 */
/**
 * @swagger
 * /api/immich/asset/{assetId}/download:
 *   get:
 *     summary: Proxy Immich download
 *     description: |
 *       Returns a high-res original asset for download. 
 *       Validates gallery download settings before serving.
 *     tags: [Immich]
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: studioId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: File stream
 *         content:
 *           application/octet-stream: { schema: { type: string, format: binary } }
 *       403:
 *         description: Downloads disabled
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const studioId = searchParams.get('studioId');

  if (!token || !studioId || !verifyAssetToken(token, params.assetId, studioId)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Double check gallery settings for download enablement
  const supabase = createAdminClient();
  const { data: photo } = await supabase
    .from('gallery_photos')
    .select('galleries(is_download_enabled)')
    .eq('immich_asset_id', params.assetId)
    .single();

  if (photo && !(photo.galleries as any).is_download_enabled) {
    return new NextResponse('Downloads are disabled for this gallery', { status: 403 });
  }

  const immichUrl = `${process.env.IMMICH_BASE_URL}/api/assets/${params.assetId}/original`;
  
  try {
    const response = await fetch(immichUrl, {
      headers: { 'x-api-key': process.env.IMMICH_API_KEY as string }
    });

    if (!response.ok) return new NextResponse('Failed to fetch asset', { status: response.status });

    // Stream the body directly
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': response.headers.get('Content-Disposition') || `attachment; filename="photo-${params.assetId}"`,
      }
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
