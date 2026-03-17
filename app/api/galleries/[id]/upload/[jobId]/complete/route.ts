import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { immichClient } from '@/lib/immich/client';
import { logError } from '@/lib/logger';
import { updateSyncJob } from '@/lib/immich/sync-logger';

/**
 * POST /api/galleries/[id]/upload/[jobId]/complete
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string, jobId: string } }
) {
  try {
    const supabase = createAdminClient();
    
    // 1. Verify Job
    const { data: job, error: jErr } = await supabase
        .from('file_upload_jobs')
        .select('*')
        .eq('id', params.jobId)
        .single();
    
    if (jErr || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // 2. Add assets to Immich Album
    const { data: photos } = await supabase
        .from('gallery_photos')
        .select('immich_asset_id')
        .eq('gallery_id', params.id);
    
    const { data: gallery } = await supabase
        .from('galleries')
        .select('immich_album_id')
        .eq('id', params.id)
        .single();

    if (photos && photos.length > 0 && gallery) {
        const assetIds = photos.map(p => p.immich_asset_id);
        await immichClient.addAssetsToAlbum(gallery.immich_album_id, assetIds);
    }

    // 3. Update Statuses
    const isPartial = job.failed_files > 0;
    await supabase.from('file_upload_jobs').update({
        status: isPartial ? 'partial' : 'completed'
    }).eq('id', params.jobId);

    await updateSyncJob(params.jobId, { status: 'completed', completedAt: new Date().toISOString() });

    const { data: updatedGallery } = await supabase.from('galleries').update({
        status: 'ready',
        total_photos: job.processed_files,
        total_size_mb: job.total_size_mb // In real scenario, would be sum of processed files
    }).eq('id', params.id).select().single();

    // 4. Trigger Face Detection (Mocking background poll - in production this would be an enqueue)
    await supabase.from('immich_sync_jobs').insert({
        studio_id: job.studio_id,
        gallery_id: params.id,
        operation: 'face_detection_poll',
        status: 'queued'
    });

    return NextResponse.json({ 
        uploaded: job.processed_files, 
        failed: job.failed_files, 
        gallery_status: 'ready' 
    });

  } catch (error: any) {
    await logError({ message: 'Complete upload failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
