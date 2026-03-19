import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { handleRouteError, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { PaymentService } from '@/lib/services/payment.service'
import { paymentsQuerySchema } from '@/lib/validations/invoice.schema'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const parsed = paymentsQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams.entries()))
    if (!parsed.success) return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    const result = await PaymentService.getPayments(supabase, member.studio_id, parsed.data)
    return withNoStore(Response.paginated(result.data, result.count, parsed.data.page, parsed.data.pageSize))
  } catch (err) {
    return handleRouteError(err, req)
  }
}
