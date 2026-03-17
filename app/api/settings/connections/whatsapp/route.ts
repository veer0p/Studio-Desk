import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';
import { encrypt } from '@/lib/crypto';

/**
 * @swagger
 * /api/settings/connections/whatsapp:
 *   get:
 *     summary: Get WhatsApp connection status
 *     description: Returns the connected WhatsApp phone number.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Connection status
 *   post:
 *     summary: Connect WhatsApp
 *     description: Updates WhatsApp Business API credentials (cloud API). Owner only.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [whatsapp_phone_number, whatsapp_api_key]
 *             properties:
 *               whatsapp_phone_number: { type: 'string' }
 *               whatsapp_api_key: { type: 'string' }
 *     responses:
 *       200:
 *         description: Connected successfully
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: studio, error } = await supabase
      .from('studios')
      .select('whatsapp_phone_number')
      .eq('id', member.studio_id)
      .single();

    if (error) throw error;
    return NextResponse.json({ 
      connected: !!studio?.whatsapp_phone_number,
      whatsapp_phone_number: studio?.whatsapp_phone_number
    });
  } catch (error: any) {
    console.error('[SETTINGS_WHATSAPP_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req);
    const { whatsapp_phone_number, whatsapp_api_key } = await req.json();

    if (!whatsapp_phone_number || !whatsapp_api_key) {
      return NextResponse.json({ error: 'Phone number and API key are required' }, { status: 400 });
    }

    const encryptedKey = encrypt(whatsapp_api_key);

    const { error } = await supabase
      .from('studios')
      .update({
        whatsapp_phone_number,
        whatsapp_api_key: encryptedKey
      })
      .eq('id', member.studio_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[SETTINGS_WHATSAPP_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function requireAuth(req: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth: rAuth } = await import('@/lib/auth/guards');
  return rAuth(req);
}
