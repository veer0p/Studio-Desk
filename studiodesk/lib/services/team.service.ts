import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { teamRepo } from '@/lib/repositories/team.repo'
import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/errors'
import { generateSecureToken } from '@/lib/crypto'
import { sendEmail } from '@/lib/resend/client'
import { logError } from '@/lib/logger'
import { logSecurityEvent } from '@/lib/logger'
import { env } from '@/lib/env'

type UserRole = Database['public']['Tables']['studio_members']['Row']['role']

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  photographer: 'Photographer',
  videographer: 'Videographer',
  editor: 'Editor',
  assistant: 'Assistant',
}

async function findAuthUserByEmail(admin: any, email: string): Promise<{ id: string } | null> {
  const normalizedEmail = email.toLowerCase()

  try {
    if (typeof admin?.auth?.admin?.getUserByEmail === 'function') {
      const { data, error } = await admin.auth.admin.getUserByEmail(normalizedEmail)
      if (!error && data?.user?.id) {
        return { id: data.user.id }
      }
    }
  } catch {
    // Fall back to listUsers below.
  }

  try {
    const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 200 })
    if (!error) {
      const user = list?.users?.find((x: { email?: string | null }) => {
        return x.email?.toLowerCase() === normalizedEmail
      })
      if (user?.id) {
        return { id: user.id }
      }
    }
  } catch {
    return null
  }

  return null
}

function logTeamInviteEmail(studioId: string, email: string): void {
  createAdminClient()
    .from('automation_log')
    .insert({
      studio_id: studioId,
      automation_type: 'custom',
      channel: 'email',
      status: 'sent',
      recipient_email: email,
    })
    .then(({ error }) => {
      if (error) console.error('[TeamService] automation_log insert failed:', error)
    })
}

export interface TeamMember {
  id: string
  user_id: string
  role: string
  role_label: string
  display_name: string | null
  phone: string | null
  whatsapp: string | null
  specialization: string[] | null
  profile_photo_url: string | null
  is_active: boolean
  last_active_at: string | null
  invited_at: string | null
  accepted_at: string | null
}

export interface AcceptResult {
  studio_name: string
  role: string
  email: string
  user_existed: boolean
  message: string
}

function toTeamMember(row: Record<string, unknown>): TeamMember {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    role: row.role as string,
    role_label: ROLE_LABELS[(row.role as UserRole) ?? 'assistant'],
    display_name: (row.display_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    whatsapp: (row.whatsapp as string | null) ?? null,
    specialization: (row.specialization as string[] | null) ?? null,
    profile_photo_url: (row.profile_photo_url as string | null) ?? null,
    is_active: (row.is_active as boolean) ?? true,
    last_active_at: row.last_active_at
      ? typeof row.last_active_at === 'string'
        ? row.last_active_at
        : new Date(row.last_active_at as Date).toISOString()
      : null,
    invited_at: row.invited_at
      ? typeof row.invited_at === 'string'
        ? row.invited_at
        : new Date(row.invited_at as Date).toISOString()
      : null,
    accepted_at: row.accepted_at
      ? typeof row.accepted_at === 'string'
        ? row.accepted_at
        : new Date(row.accepted_at as Date).toISOString()
      : null,
  }
}

export const TeamService = {
  async getMembers(supabase: SupabaseClient<Database>, studioId: string): Promise<TeamMember[]> {
    const rows = await teamRepo.getMembers(supabase, studioId)
    return rows.map(toTeamMember)
  },

  async inviteMember(
    supabase: SupabaseClient<Database>,
    params: {
      studioId: string
      email: string
      role: UserRole
      invitedBy: string
      invitedByMemberId: string
    }
  ): Promise<{ invitation_id: string; email: string; resent: boolean }> {
    if (params.role === 'owner') {
      throw Errors.validation('Cannot invite a member with owner role')
    }

    const admin = createAdminClient()

    // Already active member: check before plan limit so we return 409, not 422.
    const authUser = await findAuthUserByEmail(admin, params.email)
    const authUserId = authUser?.id ?? null
    if (authUserId) {
      const existing = await teamRepo.getMemberByUserId(admin, authUserId, params.studioId)
      if (existing) throw Errors.conflict('This email is already a team member')
    }

    // Pending invitation: resend/refresh without enforcing plan limit (no new slot used).
    const pending = await teamRepo.getInvitationByEmail(admin, params.email, params.studioId)
    const now = new Date()
    const expiresAt = pending ? new Date((pending as { expires_at: string }).expires_at) : null

    if (pending && expiresAt && expiresAt > now) {
      await teamRepo.incrementResendCount(admin, (pending as { id: string }).id)
      const studioName = await teamRepo.getStudioName(admin, params.studioId)
      const acceptLink = `${env.NEXT_PUBLIC_APP_URL}/api/v1/team/accept/${(pending as { token: string }).token}`
      sendEmail({
        to: params.email,
        subject: `You have been invited to join ${studioName} on StudioDesk`,
        html: `You are invited as <strong>${ROLE_LABELS[params.role]}</strong>. <a href="${acceptLink}">Accept invitation</a>. Expires in 48 hours.`,
        studioId: params.studioId,
      }).catch((err) => logError({ message: String(err), context: { email: params.email } }))
      logTeamInviteEmail(params.studioId, params.email)
      logSecurityEvent({
        eventType: 'api_key_created',
        req: {} as any,
        studioId: params.studioId,
        context: { action: 'team_invite', invited_email: params.email, role: params.role },
      }).catch(() => {})
      return {
        invitation_id: (pending as { id: string }).id,
        email: params.email,
        resent: true,
      }
    }

    if (pending && expiresAt && expiresAt <= now) {
      const newToken = generateSecureToken(32)
      await teamRepo.updateInvitationTokenAndExpiry(admin, (pending as { id: string }).id, newToken)
      const studioName = await teamRepo.getStudioName(admin, params.studioId)
      const acceptLink = `${env.NEXT_PUBLIC_APP_URL}/api/v1/team/accept/${newToken}`
      sendEmail({
        to: params.email,
        subject: `You have been invited to join ${studioName} on StudioDesk`,
        html: `You are invited as <strong>${ROLE_LABELS[params.role]}</strong>. <a href="${acceptLink}">Accept invitation</a>. Expires in 48 hours.`,
        studioId: params.studioId,
      }).catch((err) => logError({ message: String(err), context: { email: params.email } }))
      logTeamInviteEmail(params.studioId, params.email)
      return {
        invitation_id: (pending as { id: string }).id,
        email: params.email,
        resent: true,
      }
    }

    // New invitation: enforce plan limit only when creating a new invite.
    const [count, nonOwnerCount, limit] = await Promise.all([
      teamRepo.countActiveMembers(supabase, params.studioId),
      teamRepo.countActiveNonOwnerMembers(supabase, params.studioId),
      teamRepo.getPlanMemberLimit(supabase, params.studioId),
    ])
    const occupiedSeats = limit > 1 ? nonOwnerCount : count
    if (occupiedSeats >= limit) {
      const e = Errors.quotaExceeded()
      e.message = `Member limit reached for your plan (${occupiedSeats}/${limit})`
      throw e
    }

    const token = generateSecureToken(32)
    const expiresAtNew = new Date()
    expiresAtNew.setHours(expiresAtNew.getHours() + 48)
    const inv = await teamRepo.createInvitation(admin, {
      studio_id: params.studioId,
      invited_by: params.invitedByMemberId,
      email: params.email,
      role: params.role,
      token,
      expires_at: expiresAtNew.toISOString(),
    })

    const studioName = await teamRepo.getStudioName(admin, params.studioId)
    const acceptLink = `${env.NEXT_PUBLIC_APP_URL}/api/v1/team/accept/${token}`
    sendEmail({
      to: params.email,
      subject: `You have been invited to join ${studioName} on StudioDesk`,
      html: `You are invited as <strong>${ROLE_LABELS[params.role]}</strong>. <a href="${acceptLink}">Accept invitation</a>. Expires in 48 hours.`,
      studioId: params.studioId,
    }).catch((err) => logError({ message: String(err), context: { email: params.email } }))

    logTeamInviteEmail(params.studioId, params.email)

    logSecurityEvent({
      eventType: 'api_key_created',
      req: {} as any,
      studioId: params.studioId,
      context: { action: 'team_invite', invited_email: params.email, role: params.role },
    }).catch(() => {})

    return { invitation_id: (inv as { id: string }).id, email: params.email, resent: false }
  },

  async acceptInvitation(token: string, req?: { headers: (n: string) => string | null }): Promise<AcceptResult> {
    const admin = createAdminClient()
    const invitation = await teamRepo.getInvitationByToken(admin, token)
    if (!invitation) throw Errors.notFound('Invitation')
    const inv = invitation as { id: string; studio_id: string; email: string; role: UserRole; accepted_at: string | null; expires_at: string }
    if (inv.accepted_at) throw Errors.conflict('Invitation already accepted')
    const expiresAt = new Date(inv.expires_at)
    if (expiresAt < new Date()) {
      throw Errors.validation('Invitation has expired. Ask the studio owner to resend.')
    }

    let userId: string | null = null
    let userExisted = false
    const existingAuthUser = await findAuthUserByEmail(admin, inv.email)
    userId = existingAuthUser?.id ?? null
    userExisted = Boolean(userId)

    if (!userId) {
      const tempPassword = generateSecureToken(16)
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: inv.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { invited_via: 'studio_invitation' },
      })
      userId = created?.user?.id ?? null
      if (!userId) {
        throw Errors.validation(createErr?.message ?? 'Failed to create user')
      }
    }

    const existingMember = await teamRepo.getMemberByUserId(admin, userId, inv.studio_id)
    if (existingMember) {
      const ex = existingMember as { is_active: boolean }
      if (ex.is_active) throw Errors.conflict('Already a member of this studio')
      await teamRepo.setMemberActive(admin, (existingMember as { id: string }).id, inv.studio_id, true)
    } else {
      await teamRepo.createMember(admin, {
        studio_id: inv.studio_id,
        user_id: userId,
        role: inv.role,
        display_name: inv.email.split('@')[0],
        accepted_at: new Date().toISOString(),
      })
    }

    await teamRepo.markInvitationAccepted(admin, inv.id)
    const studioName = await teamRepo.getStudioName(admin, inv.studio_id)

    if (req) {
      logSecurityEvent({
        eventType: 'login_success',
        req: req as any,
        context: { via: 'team_invitation', studio_id: inv.studio_id },
      }).catch(() => {})
    }

    return {
      studio_name: studioName,
      role: inv.role,
      email: inv.email,
      user_existed: userExisted,
      message: userExisted
        ? 'Invitation accepted. You can log in with your existing account.'
        : 'Invitation accepted. Please set your password to log in.',
    }
  },

  async updateMemberRole(
    supabase: SupabaseClient<Database>,
    params: {
      memberId: string
      studioId: string
      newRole: UserRole
      requestingMemberId: string
    }
  ): Promise<TeamMember> {
    if (params.newRole === 'owner') {
      throw Errors.validation('Cannot assign owner role. Transfer ownership instead.')
    }
    const member = await teamRepo.getMemberById(supabase, params.memberId, params.studioId)
    if (!member) throw Errors.notFound('Team member')
    const m = member as { id: string; role: UserRole }
    if (m.id === params.requestingMemberId) {
      throw Errors.validation('Cannot change your own role')
    }
    if (m.role === 'owner') {
      throw Errors.validation('Cannot change role of studio owner')
    }
    const updated = await teamRepo.updateMemberRole(supabase, params.memberId, params.studioId, params.newRole)
    return toTeamMember(updated as Record<string, unknown>)
  },

  async removeMember(
    supabase: SupabaseClient<Database>,
    params: {
      memberId: string
      studioId: string
      requestingMemberId: string
    }
  ): Promise<void> {
    const member = await teamRepo.getMemberById(supabase, params.memberId, params.studioId)
    if (!member) throw Errors.notFound('Team member')
    const m = member as { id: string; role: UserRole }
    if (m.id === params.requestingMemberId) throw Errors.validation('Cannot remove yourself from studio')
    if (m.role === 'owner') throw Errors.validation('Cannot remove studio owner')
    await teamRepo.deactivateMember(supabase, params.memberId, params.studioId)
  },
}
