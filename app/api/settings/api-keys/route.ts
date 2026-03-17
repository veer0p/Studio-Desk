import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth/guards';
import { generateSecureToken } from '@/lib/crypto';
import crypto from 'crypto';

/**
 * @swagger
 * /api/settings/api-keys:
 *   get:
 *     summary: List API keys
 *     description: Returns all active API keys for the studio (masked).
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/APIKey' }
 *   post:
 *     summary: Create API key
 *     description: Generates a new API key. The full key is only shown ONCE. Owner only.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: 'string', example: 'Zapier Integration' }
 *               scopes: { type: 'array', items: { type: 'string' }, default: ['read'] }
 *     responses:
 *       201:
 *         description: Key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api_key: { type: 'string' }
 *                 id: { type: 'string', format: 'uuid' }
 */
export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req);
    const { data: keys, error } = await supabase
      .from('studio_api_keys')
      .select('*')
      .eq('studio_id', member.studio_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(keys);
  } catch (error: any) {
    console.error('[SETTINGS_API_KEYS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req);
    const { name, scopes } = await req.json();

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const rawKey = `sd_${generateSecureToken()}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 7) + '...';

    const { data: key, error } = await supabase
      .from('studio_api_keys')
      .insert({
        studio_id: member.studio_id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes: scopes || ['read'],
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ api_key: rawKey, id: key.id }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[SETTINGS_API_KEYS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/settings/api-keys/{id}:
 *   delete:
 *     summary: Revoke API key
 *     description: Permanently deactivates an API key.
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Key revoked successfully
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { member, supabase } = await requireOwner(req);

    const { error } = await supabase
      .from('studio_api_keys')
      .update({ is_active: false })
      .eq('id', params.id)
      .eq('studio_id', member.studio_id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('[SETTINGS_API_KEYS_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function requireAuth(req: NextRequest) {
  const { createClient } = await import('@/lib/supabase/server');
  const { requireAuth: rAuth } = await import('@/lib/auth/guards');
  return rAuth(req);
}
