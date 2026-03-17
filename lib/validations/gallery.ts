import { z } from 'zod';

export const createGallerySchema = z.object({
  booking_id: z.string().uuid(),
  expires_at: z.string().optional(),
});

export const updateGallerySchema = z.object({
  expires_at: z.string().optional(),
  password: z.string().min(4).optional().or(z.literal('')),
  is_download_enabled: z.boolean().optional(),
  watermark_settings: z.record(z.any()).optional(),
});

export const initiateUploadSchema = z.object({
  file_count: z.number().int().positive().max(1000),
  total_size_mb: z.number().positive(),
  filenames: z.array(z.string()).min(1),
});

export const labelClusterSchema = z.object({
  label: z.string().min(1, 'Label is required'),
});

export const selfieSearchSchema = z.object({
    // Handled via multipart/form-data validation in route, 
    // but here for inferred type consistency
    selfie: z.any().optional() 
});

export const galleryPasswordSchema = z.object({
    password: z.string().min(1, 'Password required')
});

export const favoritePhotoSchema = z.object({
  photo_id: z.string().uuid(),
  guest_token: z.string().min(10)
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;
export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;
export type LabelClusterInput = z.infer<typeof labelClusterSchema>;
export type FavoritePhotoInput = z.infer<typeof favoritePhotoSchema>;
