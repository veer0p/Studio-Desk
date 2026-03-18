import { z } from 'zod'

export const amountSchema = z.string().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Invalid amount format')
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
export const gstinSchema = z.string().regex(
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  'Invalid GSTIN'
)
export const panSchema = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN')
export const ifscSchema = z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC')
export const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid 6-digit pincode')
export const uuidSchema = z.string().uuid()
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')

export const paginationSchema = z.object({
  page: z.number().int().min(0).default(0),
  pageSize: z.number().int().min(1).max(100).default(20),
})
