import { z } from 'zod'
import { phoneSchema } from './common.schema'

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  studioName: z.string().min(2),
  studioSlug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8),
})

export const updateMeSchema = z
  .object({
    full_name: z.string().min(2).max(200).optional(),
    phone: phoneSchema.optional(),
    whatsapp: phoneSchema.optional().nullable(),
    preferred_language: z.string().max(50).optional().nullable(),
    designation: z.string().max(100).optional().nullable(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided',
  })

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type UpdateMeInput = z.infer<typeof updateMeSchema>
