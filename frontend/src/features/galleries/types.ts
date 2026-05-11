export type GalleryStatus = 'draft' | 'published' | 'expired' | 'archived';

export type UploadJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface GallerySummary {
  id: string;
  studio_id: string;
  booking_id: string;
  name: string;
  slug: string;
  status: GalleryStatus;
  total_photos: number;
  total_videos: number;
  published_at: string | null;
  expires_at: string | null;
  booking_title: string;
  event_type: string | null;
  event_date: string | null;
  client_name: string;
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface FaceCluster {
  id: string;
  gallery_id: string;
  studio_id: string;
  immich_person_id: string | null;
  label: string | null;
  thumbnail_url: string | null;
  face_count: number;
  is_labeled: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryDetail extends GallerySummary {
  immich_album_id: string | null;
  cover_photo_immich_id: string | null;
  share_link_url: string | null;
  qr_code_url: string | null;
  access_token: string | null;
  client_access_token: string | null;
  total_size_mb: number;
  is_download_enabled: boolean;
  client_phone: string | null;
  client_email: string | null;
  studio_name: string | null;
  studio_logo_url: string | null;
  studio_brand_color: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  face_clusters: FaceCluster[];
}

export interface UploadJob {
  job_id: string;
  status: UploadJobStatus;
  total_files: number;
  processed_files: number;
  failed_files: number;
  progress_pct: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface GalleryListParams {
  status?: GalleryStatus;
  page?: number;
  pageSize?: number;
}
