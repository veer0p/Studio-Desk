import { z } from 'zod'

export const redeemReferralSchema = z.object({
  code: z.string().min(1),
  new_studio_id: z.string().uuid(),
})

export type RedeemReferralInput = z.infer<typeof redeemReferralSchema>
