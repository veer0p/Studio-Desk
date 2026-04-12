import { z } from 'zod'

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(50),
  scopes: z.array(z.string()).min(1),
  expires_at: z.string().datetime().optional().nullable(),
})

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  scopes: z.array(z.string()).optional(),
  expires_at: z.string().datetime().optional().nullable(),
})

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>
