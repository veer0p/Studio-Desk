import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';
import { npsResponseSchema } from '@/lib/validations/portal';

/**
 * @swagger
 * /api/admin/nps:
 *   post:
 *     summary: Submit NPS response
 *     description: Records user feedback and NPS score.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [score]
 *             properties:
 *               score: { type: 'integer', minimum: 0, maximum: 10 }
 *               comment: { type: 'string' }
 *     responses:
 *       201:
 *         description: Response recorded successfully
 */
export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);

    const body = await req.json();
    const validated = npsResponseSchema.parse(body);

    const { error } = await supabase
      .from('nps_responses')
      .insert({
        studio_id: member.studio_id,
        member_id: member.id,
        ...validated
      });

    if (error) throw error;

    return new NextResponse(null, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[ADMIN_NPS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
