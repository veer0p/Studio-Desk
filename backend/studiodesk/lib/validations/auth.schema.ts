import { z } from 'zod'

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

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
