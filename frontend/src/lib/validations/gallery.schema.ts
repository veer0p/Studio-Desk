import { z } from 'zod';

export const createGallerySchema = z.object({
  booking_id: z.string().uuid('Select a booking'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(200).optional(),
});

export const publishGallerySchema = z.object({
  allow_download: z.boolean().default(true),
  expires_at: z.string().datetime({ offset: true }).optional(),
});

export const labelClusterSchema = z.object({
  label: z.string().min(1).max(100),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type PublishGalleryInput = z.infer<typeof publishGallerySchema>;
export type LabelClusterInput = z.infer<typeof labelClusterSchema>;
