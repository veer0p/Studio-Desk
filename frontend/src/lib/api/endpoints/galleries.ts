import { apiGet, apiGetList, apiPost, apiPatch } from '@/lib/api/client';
import type {
  GalleryDetail,
  GallerySummary,
  FaceCluster,
  UploadJob,
  GalleryListParams,
} from '@/features/galleries/types';
import type { CreateGalleryInput, PublishGalleryInput } from '@/lib/validations/gallery.schema';

type UploadFile = { name: string; mimeType: string; size: number; data: string; taken_at?: string };

function toSearchParams(params: GalleryListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.status) out.status = params.status;
  if (params.page !== undefined) out.page = String(params.page);
  if (params.pageSize !== undefined) out.pageSize = String(params.pageSize);
  return out;
}

export function listGalleries(params: GalleryListParams = {}) {
  return apiGetList<GallerySummary>('galleries', { searchParams: toSearchParams(params) });
}

export function getGallery(id: string) {
  return apiGet<GalleryDetail>(`galleries/${id}`);
}

export function createGallery(data: CreateGalleryInput) {
  return apiPost<GalleryDetail>('galleries', data);
}

export function updateGallery(id: string, data: { name: string }) {
  return apiPatch<GalleryDetail>(`galleries/${id}`, data);
}

export function uploadPhotos(id: string, files: UploadFile[]) {
  return apiPost<{ job_id: string; message: string }>(`galleries/${id}/upload`, { files });
}

export function getUploadJob(galleryId: string, jobId: string) {
  return apiGet<UploadJob>(`galleries/${galleryId}/upload-status`, { searchParams: { job_id: jobId } });
}

export function publishGallery(id: string, data: PublishGalleryInput) {
  return apiPost<GalleryDetail>(`galleries/${id}/publish`, data);
}

export function getGalleryClusters(id: string) {
  return apiGet<FaceCluster[]>(`galleries/${id}/clusters`);
}
