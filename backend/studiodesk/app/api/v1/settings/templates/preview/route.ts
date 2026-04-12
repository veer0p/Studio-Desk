import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { logError } from '@/lib/logger'

/**
 * POST /api/v1/settings/templates/preview
 * Preview template with variable substitution.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { template_content, variables } = body

    if (!template_content || !variables) {
      return ApiResponse.error('template_content and variables are required', 'VALIDATION_ERROR', 400)
    }

    // Simple variable substitution: {{variable_name}}
    let rendered = template_content
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    }

    return ApiResponse.ok({ rendered })
  } catch (err: any) {
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
