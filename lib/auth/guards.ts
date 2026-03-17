import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMemberByUserId } from '@/lib/supabase/queries';

/**
 * requireAuth
 * 
 * Ensures a user is authenticated. 
 * Returns user, member details, and the supabase client.
 * Throws a 401 response if not authenticated.
 */
export async function requireAuth(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new NextResponse(
      JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const member = await getMemberByUserId(supabase, user.id);
  if (!member) {
    throw new NextResponse(
      JSON.stringify({ error: 'Forbidden: Studio member profile not found', code: 'MEMBER_NOT_FOUND' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return { user, member, supabase };
}

/**
 * requireOwner
 * 
 * Ensures the authenticated user has the 'owner' role.
 */
export async function requireOwner(req: NextRequest) {
  const { user, member, supabase } = await requireAuth(req);

  if (member.role !== 'owner') {
    throw new NextResponse(
      JSON.stringify({ error: 'Forbidden: Owner permission required', code: 'FORBIDDEN' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return { user, member, supabase };
}

/**
 * requirePermission
 * 
 * Placeholder for role-based permission checking (Module 8).
 * Currently checks role mapping; will expand to check role_permissions table.
 */
export async function requirePermission(
  req: NextRequest,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
) {
  const { user, member, supabase } = await requireAuth(req);

  // Simple role check for now; will be replaced with DB permission check later
  const { data: permission } = await supabase
    .from('role_permissions')
    .select('id')
    .eq('role', member.role)
    .eq('resource', resource)
    .eq('action', action)
    .single();

  if (!permission && member.role !== 'owner') {
    throw new NextResponse(
      JSON.stringify({ 
        error: `Forbidden: No permission to ${action} ${resource}`, 
        code: 'INSUFFICIENT_PERMISSIONS' 
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return { user, member, supabase };
}
