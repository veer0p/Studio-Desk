import { z } from 'zod'
import { uuidSchema } from '@/lib/validations/common.schema'

const galleryStatusSchema = z.enum(['draft', 'published', 'expired', 'archived'])

export const galleriesQuerySchema = z.object({
  booking_id: uuidSchema.optional(),
  status: galleryStatusSchema.optional(),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const createGallerySchema = z.object({
  booking_id: uuidSchema,
  name: z.string().min(2).max(200).optional(),
})

export const updateGallerySchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field required',
  })

export const uploadPhotosSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        mimeType: z.enum([
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/heic',
          'image/heif',
          'video/mp4',
          'video/quicktime',
        ]),
        size: z.number().int().positive().max(52428800),
        data: z.string().min(1),
        taken_at: z.string().datetime().optional(),
      })
    )
    .min(1)
    .max(50),
})

export const uploadStatusQuerySchema = z.object({
  job_id: uuidSchema,
})

export const labelClusterSchema = z.object({
  label: z.string().min(1).max(100),
})

export const publishGallerySchema = z.object({
  expires_at: z.string().datetime().optional(),
  allow_download: z.boolean().default(true),
})

export const selfieUploadSchema = z.object({
  selfie: z.object({
    name: z.string().min(1).max(255),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    size: z.number().int().positive().max(5242880),
    data: z.string().min(1),
  }),
})

export type GalleriesQueryInput = z.infer<typeof galleriesQuerySchema>
export type CreateGalleryInput = z.infer<typeof createGallerySchema>
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>
export type UploadPhotosInput = z.infer<typeof uploadPhotosSchema>
export type PublishGalleryInput = z.infer<typeof publishGallerySchema>
export type SelfieUploadInput = z.infer<typeof selfieUploadSchema>
