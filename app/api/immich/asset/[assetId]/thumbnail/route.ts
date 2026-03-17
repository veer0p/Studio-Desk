import { NextRequest, NextResponse } from 'next/server';
import { verifyAssetToken } from '@/lib/immich/proxy';

/**
 * GET /api/immich/asset/[assetId]/thumbnail
 */
/**
 * @swagger
 * /api/immich/asset/{assetId}/thumbnail:
 *   get:
 *     summary: Proxy Immich thumbnail
 *     description: Returns a secure public thumbnail for an Immich asset using signed access tokens.
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
 *         description: Image stream
 *         content:
 *           image/jpeg: { schema: { type: string, format: binary } }
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

  const immichUrl = `${process.env.IMMICH_BASE_URL}/api/assets/${params.assetId}/thumbnail?size=thumbnail`;
  
  try {
    const response = await fetch(immichUrl, {
      headers: { 'x-api-key': process.env.IMMICH_API_KEY as string }
    });

    if (!response.ok) return new NextResponse('Failed to fetch thumbnail', { status: response.status });

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
