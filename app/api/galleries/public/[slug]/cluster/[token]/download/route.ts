import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { immichClient } from '@/lib/immich/client';
import archiver from 'archiver';

/**
 * GET /api/galleries/public/[slug]/cluster/[token]/download
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string, token: string } }
) {
  try {
    const supabase = createAdminClient();
    
    // 1. Validate
    const { data: cluster } = await supabase
      .from('face_clusters')
      .select('*, studio:studios(name), gallery:galleries(*)')
      .eq('qr_access_token', params.token)
      .single();

    if (!cluster || (cluster.gallery as any).slug !== params.slug) return new NextResponse('Unauthorized', { status: 401 });
    const gallery = cluster.gallery as any;
    if (!gallery.is_download_enabled) return new NextResponse('Downloads disabled', { status: 403 });

    // 2. Fetch Assets
    const assets = await immichClient.getPersonAssets(cluster.immich_person_id);
    
    // 3. Prepare ZIP Stream
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    const stream = new ReadableStream({
        async start(controller) {
            archive.on('data', (data) => controller.enqueue(data));
            archive.on('end', () => controller.close());
            archive.on('error', (err) => controller.error(err));

            for (const asset of assets) {
                const response = await fetch(`${process.env.IMMICH_BASE_URL}/api/assets/${asset.id}/original`, {
                    headers: { 'x-api-key': process.env.IMMICH_API_KEY as string }
                });
                if (response.ok && response.body) {
                    // Archiver expects Buffer, Stream, or string
                    const buffer = Buffer.from(await response.arrayBuffer());
                    archive.append(buffer, { name: asset.originalFileName });
                }
            }
            archive.finalize();
        }
    });

    // 4. Log Download
    await supabase.from('gallery_share_logs').insert({
        gallery_id: gallery.id,
        event_type: 'download',
        cluster_token: params.token
    });

    const filename = `${(cluster.studio as any).name}-${gallery.event_date}.zip`.replace(/\s+/g, '_');

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`
        }
    });

  } catch (error: any) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
