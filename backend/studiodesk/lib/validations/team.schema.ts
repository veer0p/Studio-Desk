import { z } from 'zod'

export const inviteMemberSchema = z.object({
  email: z.string().email('Valid email required'),
  // @ts-expect-error: residual strict constraint
  role: z.enum(['photographer', 'videographer', 'editor', 'assistant'], {
    errorMap: () => ({
      message: 'Role must be photographer, videographer, editor, or assistant',
    }),
  }),
})

export const updateRoleSchema = z.object({
  role: z.enum(['photographer', 'videographer', 'editor', 'assistant']),
})

export const tokenSchema = z.string().length(64).regex(/^[0-9a-fA-F]+$/, 'Token must be 64 hex characters')

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
