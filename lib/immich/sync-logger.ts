import { createAdminClient } from '../supabase/admin';

export interface SyncJobParams {
  studioId: string;
  galleryId?: string;
  uploadJobId?: string;
  operation: string;
  status?: string;
  assetIds?: string[];
  responseData?: any;
}

/**
 * Log every Immich operation to immich_sync_jobs
 */
export async function createSyncJob(params: SyncJobParams) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('immich_sync_jobs')
    .insert({
      studio_id: params.studioId,
      gallery_id: params.galleryId,
      upload_job_id: params.uploadJobId,
      operation: params.operation,
      status: params.status || 'queued',
      immich_asset_ids: params.assetIds || [],
      response_payload: params.responseData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSyncJob(jobId: string, updates: Partial<{
  status: string;
  completedAt: string;
  errorMessage: string;
  assetIds: string[];
  responseData: any;
  retryCount: number;
}>) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('immich_sync_jobs')
    .update({
      status: updates.status,
      completed_at: updates.completedAt,
      error_message: updates.errorMessage,
      immich_asset_ids: updates.assetIds,
      response_payload: updates.responseData,
      retry_count: updates.retryCount
    })
    .eq('id', jobId);

  if (error) console.error('Failed to update sync job log:', error);
}

/**
 * Lightweight fire-and-forget logging
 */
export function logImmichOperation(params: SyncJobParams) {
    createSyncJob(params).catch(err => console.error('Silent sync log failed:', err));
}
