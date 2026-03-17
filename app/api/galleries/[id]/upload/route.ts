import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { initiateUploadSchema } from '@/lib/validations/gallery';
import { createSyncJob } from '@/lib/immich/sync-logger';
import { logError } from '@/lib/logger';
import { signAssetToken } from '@/lib/immich/proxy';

/**
 * @swagger
 * /api/galleries/{id}/upload:
 *   post:
 *     summary: Initiate photo upload session
 *     description: |
 *       Validates studio storage quota and creates a file upload job.
 *       Returns a signed upload token for Immich proxy.
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InitiateUpload' }
 *     responses:
 *       200:
 *         description: Upload session initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 job_id: { type: string, format: uuid }
 *                 upload_token: { type: string }
 *                 max_file_size_mb: { type: integer }
 *       422:
 *         description: Storage quota exceeded
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);
    const body = await req.json();
    const validated = initiateUploadSchema.parse(body);

    // 1. Check Studio Quota
    const { data: studio } = await supabase
        .from('studios')
        .select('storage_used_gb, storage_limit_gb')
        .eq('id', member.studio_id)
        .single();
    
    if (!studio) return NextResponse.json({ error: 'Studio not found' }, { status: 404 });

    const uploadGb = validated.total_size_mb / 1024;
    if (studio.storage_used_gb + uploadGb > studio.storage_limit_gb) {
        return NextResponse.json({ 
            error: 'Storage quota exceeded',
            code: 'STORAGE_QUOTA_EXCEEDED',
            used_gb: studio.storage_used_gb,
            limit_gb: studio.storage_limit_gb,
            upgrade_url: '/settings/billing'
        }, { status: 422 });
    }

    // 2. Create File Upload Job
    const { data: job, error: jErr } = await supabase
      .from('file_upload_jobs')
      .insert({
        studio_id: member.studio_id,
        gallery_id: params.id,
        total_files: validated.file_count,
        total_size_mb: validated.total_size_mb,
        status: 'running'
      })
      .select()
      .single();

    if (jErr) throw jErr;

    // 3. Create Immich Sync Job Log
    await createSyncJob({
        studioId: member.studio_id,
        galleryId: params.id,
        uploadJobId: job.id,
        operation: 'upload',
        status: 'running'
    });

    // 4. Generate Session Token (signed for 1 hour)
    const uploadToken = signAssetToken(job.id, member.studio_id, 3600 * 1000);

    return NextResponse.json({ 
        job_id: job.id, 
        upload_token: uploadToken,
        max_file_size_mb: 50 
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 400 });
    await logError({ message: 'Initiate upload failed', stack: error.stack });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
