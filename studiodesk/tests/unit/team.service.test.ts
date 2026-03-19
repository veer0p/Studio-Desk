import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TeamService } from '@/lib/services/team.service'
import { teamRepo } from '@/lib/repositories/team.repo'
import { createAdminClient } from '@/lib/supabase/admin'

vi.mock('@/lib/repositories/team.repo')
vi.mock('@/lib/supabase/admin')
vi.mock('@/lib/resend/client', () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logSecurityEvent: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/crypto', () => ({ generateSecureToken: () => 'a'.repeat(64) }))

const mockSupabase = {} as any

describe('TeamService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('inviteMember', () => {
    it('throws VALIDATION_ERROR when role is owner', async () => {
      await expect(
        TeamService.inviteMember(mockSupabase, {
          studioId: 's1',
          email: 'a@b.com',
          role: 'owner',
          invitedBy: 'u1',
          invitedByMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws QUOTA_EXCEEDED when count >= limit', async () => {
      vi.mocked(teamRepo.countActiveMembers).mockResolvedValue(1)
      vi.mocked(teamRepo.countActiveNonOwnerMembers).mockResolvedValue(3)
      vi.mocked(teamRepo.getPlanMemberLimit).mockResolvedValue(3)
      await expect(
        TeamService.inviteMember(mockSupabase, {
          studioId: 's1',
          email: 'a@b.com',
          role: 'photographer',
          invitedBy: 'u1',
          invitedByMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' })
    })

    it('throws CONFLICT when email is already active member', async () => {
      vi.mocked(teamRepo.countActiveMembers).mockResolvedValue(1)
      vi.mocked(teamRepo.countActiveNonOwnerMembers).mockResolvedValue(1)
      vi.mocked(teamRepo.getPlanMemberLimit).mockResolvedValue(10)
      vi.mocked(createAdminClient).mockReturnValue({
        auth: {
          admin: {
            getUserByEmail: vi.fn().mockResolvedValue({ data: { user: { id: 'auth1' } } }),
          },
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
        }),
      } as any)
      vi.mocked(teamRepo.getMemberByUserId).mockResolvedValue({ id: 'm2', is_active: true } as any)
      await expect(
        TeamService.inviteMember(mockSupabase, {
          studioId: 's1',
          email: 'existing@b.com',
          role: 'photographer',
          invitedBy: 'u1',
          invitedByMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'CONFLICT' })
    })

    it('returns resent: true when pending unexpired invite exists', async () => {
      vi.mocked(teamRepo.countActiveMembers).mockResolvedValue(1)
      vi.mocked(teamRepo.countActiveNonOwnerMembers).mockResolvedValue(1)
      vi.mocked(teamRepo.getPlanMemberLimit).mockResolvedValue(10)
      vi.mocked(createAdminClient).mockReturnValue({
        auth: { admin: { getUserByEmail: vi.fn().mockResolvedValue({ data: { user: null } }) } },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
        }),
      } as any)
      vi.mocked(teamRepo.getInvitationByEmail).mockResolvedValue({
        id: 'inv1',
        token: 't',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      } as any)
      vi.mocked(teamRepo.incrementResendCount).mockResolvedValue(undefined as any)
      vi.mocked(teamRepo.getStudioName).mockResolvedValue('Studio X')
      const result = await TeamService.inviteMember(mockSupabase, {
        studioId: 's1',
        email: 'p@b.com',
        role: 'photographer',
        invitedBy: 'u1',
        invitedByMemberId: 'm1',
      })
      expect(result.resent).toBe(true)
      expect(teamRepo.incrementResendCount).toHaveBeenCalled()
    })

    it('creates invitation and returns resent: false for new invite', async () => {
      vi.mocked(teamRepo.countActiveMembers).mockResolvedValue(1)
      vi.mocked(teamRepo.countActiveNonOwnerMembers).mockResolvedValue(1)
      vi.mocked(teamRepo.getPlanMemberLimit).mockResolvedValue(10)
      vi.mocked(createAdminClient).mockReturnValue({
        auth: { admin: { getUserByEmail: vi.fn().mockResolvedValue({ data: { user: null } }) } },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
        }),
      } as any)
      vi.mocked(teamRepo.getInvitationByEmail).mockResolvedValue(null)
      vi.mocked(teamRepo.createInvitation).mockResolvedValue({ id: 'inv-new' } as any)
      vi.mocked(teamRepo.getStudioName).mockResolvedValue('Studio X')
      const result = await TeamService.inviteMember(mockSupabase, {
        studioId: 's1',
        email: 'new@b.com',
        role: 'photographer',
        invitedBy: 'u1',
        invitedByMemberId: 'm1',
      })
      expect(result.resent).toBe(false)
      expect(result.invitation_id).toBe('inv-new')
      expect(teamRepo.createInvitation).toHaveBeenCalled()
    })

    it('allows a paid-plan owner seat without consuming invite quota', async () => {
      vi.mocked(teamRepo.countActiveMembers).mockResolvedValue(3)
      vi.mocked(teamRepo.countActiveNonOwnerMembers).mockResolvedValue(2)
      vi.mocked(teamRepo.getPlanMemberLimit).mockResolvedValue(3)
      vi.mocked(createAdminClient).mockReturnValue({
        auth: { admin: { getUserByEmail: vi.fn().mockResolvedValue({ data: { user: null } }) } },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue(Promise.resolve({ error: null })),
        }),
      } as any)
      vi.mocked(teamRepo.getInvitationByEmail).mockResolvedValue(null)
      vi.mocked(teamRepo.createInvitation).mockResolvedValue({ id: 'inv-paid-plan' } as any)
      vi.mocked(teamRepo.getStudioName).mockResolvedValue('Studio X')

      const result = await TeamService.inviteMember(mockSupabase, {
        studioId: 's1',
        email: 'owner-seat@b.com',
        role: 'assistant',
        invitedBy: 'u1',
        invitedByMemberId: 'm1',
      })

      expect(result.invitation_id).toBe('inv-paid-plan')
      expect(result.resent).toBe(false)
    })
  })

  describe('acceptInvitation', () => {
    it('throws NOT_FOUND when token not found', async () => {
      vi.mocked(teamRepo.getInvitationByToken).mockResolvedValue(null)
      await expect(TeamService.acceptInvitation('a'.repeat(64))).rejects.toMatchObject({
        code: 'NOT_FOUND',
      })
    })

    it('throws CONFLICT when already accepted', async () => {
      vi.mocked(teamRepo.getInvitationByToken).mockResolvedValue({
        id: 'i1',
        accepted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600).toISOString(),
      } as any)
      await expect(TeamService.acceptInvitation('a'.repeat(64))).rejects.toMatchObject({
        code: 'CONFLICT',
      })
    })

    it('throws VALIDATION_ERROR when expired', async () => {
      vi.mocked(teamRepo.getInvitationByToken).mockResolvedValue({
        id: 'i1',
        accepted_at: null,
        expires_at: new Date(Date.now() - 3600).toISOString(),
        studio_id: 's1',
        email: 'e@b.com',
        role: 'photographer',
      } as any)
      await expect(TeamService.acceptInvitation('a'.repeat(64))).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      })
    })
  })

  describe('updateMemberRole', () => {
    it('throws VALIDATION_ERROR when newRole is owner', async () => {
      await expect(
        TeamService.updateMemberRole(mockSupabase, {
          memberId: 'm2',
          studioId: 's1',
          newRole: 'owner',
          requestingMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws VALIDATION_ERROR when changing own role', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue({ id: 'm1', role: 'photographer' } as any)
      await expect(
        TeamService.updateMemberRole(mockSupabase, {
          memberId: 'm1',
          studioId: 's1',
          newRole: 'editor',
          requestingMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws VALIDATION_ERROR when changing owner role', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue({ id: 'm2', role: 'owner' } as any)
      await expect(
        TeamService.updateMemberRole(mockSupabase, {
          memberId: 'm2',
          studioId: 's1',
          newRole: 'editor',
          requestingMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws NOT_FOUND when member not found', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue(null)
      await expect(
        TeamService.updateMemberRole(mockSupabase, {
          memberId: 'm2',
          studioId: 's1',
          newRole: 'editor',
          requestingMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('returns updated member with role_label on success', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue({ id: 'm2', role: 'photographer' } as any)
      vi.mocked(teamRepo.updateMemberRole).mockResolvedValue({
        id: 'm2',
        role: 'videographer',
        display_name: 'Rahul',
      } as any)
      const result = await TeamService.updateMemberRole(mockSupabase, {
        memberId: 'm2',
        studioId: 's1',
        newRole: 'videographer',
        requestingMemberId: 'm1',
      })
      expect(result.role).toBe('videographer')
      expect(result.role_label).toBe('Videographer')
    })
  })

  describe('removeMember', () => {
    it('throws VALIDATION_ERROR when removing self', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue({ id: 'm1', role: 'owner' } as any)
      await expect(
        TeamService.removeMember(mockSupabase, {
          memberId: 'm1',
          studioId: 's1',
          requestingMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws VALIDATION_ERROR when removing owner', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue({ id: 'm2', role: 'owner' } as any)
      await expect(
        TeamService.removeMember(mockSupabase, {
          memberId: 'm2',
          studioId: 's1',
          requestingMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('throws NOT_FOUND when member not found', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue(null)
      await expect(
        TeamService.removeMember(mockSupabase, {
          memberId: 'm2',
          studioId: 's1',
          requestingMemberId: 'm1',
        })
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('calls deactivateMember on success', async () => {
      vi.mocked(teamRepo.getMemberById).mockResolvedValue({ id: 'm2', role: 'photographer' } as any)
      vi.mocked(teamRepo.deactivateMember).mockResolvedValue(undefined as any)
      await TeamService.removeMember(mockSupabase, {
        memberId: 'm2',
        studioId: 's1',
        requestingMemberId: 'm1',
      })
      expect(teamRepo.deactivateMember).toHaveBeenCalledWith(mockSupabase, 'm2', 's1')
    })
  })
})
