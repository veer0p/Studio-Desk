import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOwner } from '@/lib/auth/guards';


import { encrypt } from '@/lib/crypto';

/**
 * @swagger
 * /api/settings/connections/razorpay:
 *   get:
 *     summary: Get Razorpay connection status
 *     description: Returns the Razorpay key ID (masked).
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Connection status
 *   post:
 *     summary: Connect/Update Razorpay
 *     description: Updates Razorpay credentials. Secret is encrypted before storage. Owner only.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_key_id, razorpay_key_secret]
 *             properties:
 *               razorpay_key_id: { type: 'string' }
 *               razorpay_key_secret: { type: 'string' }
 *     responses:
 *       200:
 *         description: Credentials updated successfully
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: studio, error } = await (supabase
      .from('studios')
      .select('razorpay_key_id')
      .eq('id', member.studio_id)
      .single() as any);


    if (error) throw error;
    return NextResponse.json({ 
      connected: !!studio?.razorpay_key_id,
      razorpay_key_id: studio?.razorpay_key_id // Safe to show ID
    });
  } catch (error: any) {
    console.error('[SETTINGS_RAZORPAY_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req);
    const { razorpay_key_id, razorpay_key_secret } = await req.json();

    if (!razorpay_key_id || !razorpay_key_secret) {
      return NextResponse.json({ error: 'Key ID and Secret are required' }, { status: 400 });
    }

    const encryptedSecret = encrypt(razorpay_key_secret);

    const { error } = await supabase
      .from('studios')
      .update({
        razorpay_key_id,
        razorpay_key_secret: encryptedSecret
      })
      .eq('id', member.studio_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[SETTINGS_RAZORPAY_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


