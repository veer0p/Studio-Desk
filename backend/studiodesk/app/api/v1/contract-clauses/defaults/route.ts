import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { logError } from '@/lib/logger'

/**
 * Built-in system default contract clauses.
 * These are shown as reference when a studio has no custom clauses.
 */
const SYSTEM_DEFAULTS = [
  {
    title: 'Cancellation Policy',
    category: 'cancellation',
    content: 'If the Client cancels the booking less than {{notice_days}} days before the event date, a cancellation fee of {{cancellation_percentage}}% of the total amount will be charged. If the Studio cancels, the Client will receive a full refund of all payments made.',
  },
  {
    title: 'Payment Terms',
    category: 'payment',
    content: 'A non-refundable advance of {{advance_percentage}}% is due upon booking confirmation. The remaining balance must be paid within {{payment_due_days}} days of the event date. Late payments will incur a penalty of {{late_fee_percentage}}% per month.',
  },
  {
    title: 'Delivery Timeline',
    category: 'delivery',
    content: 'Final deliverables will be provided within {{delivery_days}} days of the event. Rush delivery ({{rush_delivery_days}} days) is available at an additional cost of {{rush_fee}}.',
  },
  {
    title: 'Revision Policy',
    category: 'delivery',
    content: 'The Client is entitled to {{revision_count}} rounds of revisions at no additional cost. Additional revisions will be charged at {{revision_rate}} per revision.',
  },
  {
    title: 'Usage Rights',
    category: 'copyright',
    content: 'The Studio retains copyright of all images. The Client receives a personal, non-commercial license for {{usage_scope}}. Commercial usage requires a separate licensing agreement.',
  },
  {
    title: 'Liability Limitation',
    category: 'liability',
    content: "The Studio's total liability shall not exceed the total amount paid by the Client. The Studio is not liable for circumstances beyond reasonable control including equipment failure due to environmental conditions, venue restrictions, or force majeure events.",
  },
  {
    title: 'Force Majeure',
    category: 'general',
    content: 'Neither party shall be liable for delays or failures caused by events beyond reasonable control, including natural disasters, pandemics, government restrictions, or acts of terrorism. In such cases, the Studio will offer a rescheduled date or full refund.',
  },
  {
    title: 'Client Cooperation',
    category: 'general',
    content: 'The Client agrees to provide necessary information including {{required_items}} at least {{info_deadline_days}} days before the event. Failure to cooperate may result in delivery delays for which the Studio is not responsible.',
  },
]

/**
 * GET /api/v1/contract-clauses/defaults
 * Returns system default clauses as reference.
 */
export async function GET(_req: NextRequest) {
  try {
    // Auth check — even though these are static defaults, ensure the user is authenticated
    await requireAuth(_req)

    return ApiResponse.ok(SYSTEM_DEFAULTS)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message, requestUrl: _req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
