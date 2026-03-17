import { NextRequest, NextResponse } from 'next/server';
import { verifyAssetToken } from '@/lib/immich/proxy';
import { immichClient } from '@/lib/immich/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logError } from '@/lib/logger';

/**
 * POST /api/galleries/[id]/upload/[jobId]/chunk
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string, jobId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const studioId = searchParams.get('studioId');

    // 1. Auth via session token
    if (!token || !studioId || !verifyAssetToken(token, params.jobId, studioId)) {
        return NextResponse.json({ error: 'Unauthorized upload session' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // 2. Validate
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'File too large' }, { status: 400 });
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 3. Upload to Immich
    const supabase = createAdminClient();
    const { data: gallery } = await supabase.from('galleries').select('immich_library_id').eq('id', params.id).single();
    
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await immichClient.uploadAsset(buffer, file.name, gallery.immich_library_id, file.type);

    // 4. Record Success
    const { error: pErr } = await supabase.from('gallery_photos').insert({
        gallery_id: params.id,
        studio_id: studioId,
        immich_asset_id: asset.id,
        filename: file.name,
        file_size_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
        width: asset.exifInfo?.width || 0,
        height: asset.exifInfo?.height || 0,
        taken_at: asset.exifInfo?.dateTimeOriginal || asset.localDateTime
    });

    if (pErr) throw pErr;

    // Increment success count in job
    await supabase.rpc('increment_upload_processed', { job_id: params.jobId });

    return NextResponse.json({ 
        asset_id: asset.id, 
        filename: file.name, 
        status: 'uploaded' 
    });

  } catch (error: any) {
    const supabase = createAdminClient();
    await supabase.rpc('increment_upload_failed', { 
        job_id: params.jobId, 
        error_msg: error.message 
    });
    
    await logError({ message: 'Chunk upload failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
