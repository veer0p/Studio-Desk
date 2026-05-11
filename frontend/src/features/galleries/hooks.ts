import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import {
  listGalleries,
  getGallery,
  createGallery,
  uploadPhotos,
  getUploadJob,
  publishGallery,
  getGalleryClusters,
} from '@/lib/api/endpoints/galleries';
import type { GalleryListParams } from './types';
import type { CreateGalleryInput, PublishGalleryInput } from '@/lib/validations/gallery.schema';

type UploadFile = { name: string; mimeType: string; size: number; data: string; taken_at?: string };

export function useGalleries(params: GalleryListParams) {
  return useQuery({
    queryKey: queryKeys.galleries.list(params as Record<string, unknown>),
    queryFn: () => listGalleries(params),
    placeholderData: (prev) => prev,
  });
}

export function useGallery(id: string) {
  return useQuery({
    queryKey: queryKeys.galleries.detail(id),
    queryFn: () => getGallery(id),
    enabled: !!id,
  });
}

export function useCreateGallery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGalleryInput) => createGallery(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.galleries.all });
    },
  });
}

export function useUploadPhotos(galleryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: UploadFile[]) => uploadPhotos(galleryId, files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.galleries.detail(galleryId) });
    },
  });
}

export function useUploadJob(galleryId: string, jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.galleries.uploadJob(galleryId, jobId ?? ''),
    queryFn: () => getUploadJob(galleryId, jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === 'completed' || s === 'failed') return false;
      return 3000;
    },
  });
}

export function usePublishGallery(galleryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PublishGalleryInput) => publishGallery(galleryId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.galleries.detail(galleryId) });
      qc.invalidateQueries({ queryKey: queryKeys.galleries.all });
    },
  });
}

export function useGalleryClusters(galleryId: string) {
  return useQuery({
    queryKey: queryKeys.galleries.clusters(galleryId),
    queryFn: () => getGalleryClusters(galleryId),
    enabled: !!galleryId,
  });
}
