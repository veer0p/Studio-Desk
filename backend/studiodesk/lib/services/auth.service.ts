import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { teamRepo } from '@/lib/repositories/team.repo'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMemberByUserId } from '@/lib/supabase/queries'
import { signupSchema, loginSchema, updateMeSchema, updatePasswordSchema } from '@/lib/validations/auth.schema'
export class AuthService {
  static async signup(supabase: any, input: unknown) {
    console.log('[AuthService] Initiating signup for:', (input as any)?.email)
    const validated = signupSchema.parse(input)
    console.log('[AuthService] Validation success for:', validated.email)

    const admin = createAdminClient()

    // 1. Create or check user via Admin API
    let userId: string

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        full_name: validated.fullName,
      },
    })

    if (authError) {
      console.log('[AuthService] Auth signup error, checking if user exists:', authError.message)
      // Detect duplicate user
      if (
        authError.message?.toLowerCase().includes('already registered') ||
        authError.message?.toLowerCase().includes('already been registered') ||
        (authError as any).status === 422
      ) {
        // If user exists, we check if they have a studio.
        const { data: existingUser } = await admin.from('users').select('id').eq('email', validated.email).maybeSingle()

        if (existingUser) {
          userId = existingUser.id
          // Check if they already have a studio
          const { data: existingMember } = await admin.from('studio_members').select('id').eq('user_id', userId).maybeSingle()
          if (existingMember) {
            throw Errors.conflict('An account with this email already exists and is associated with a studio')
          }
          console.log('[AuthService] Found existing user without studio, proceeding to DB creation phase:', userId)
        } else {
          const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
          const foundAuthUser = users?.find(u => u.email === validated.email)
          if (!foundAuthUser) throw Errors.conflict('An account with this email already exists in Auth')
          userId = foundAuthUser.id
        }
      } else {
        throw authError
      }
    } else {
      if (!authData.user) throw Errors.unauthorized()
      userId = authData.user.id
      console.log('[AuthService] Auth user created (auto-confirmed):', userId)
    }

    try {
      // 2. Create Studio
      const studio = await studioRepo.createStudio(admin, {
        name: validated.studioName,
        slug: validated.studioSlug,
        email: validated.email
      })

      // 3. Create Owner Member
      await teamRepo.createMember(admin, {
        studio_id: studio.id,
        user_id: userId,
        role: 'owner',
        display_name: validated.fullName,
        accepted_at: new Date().toISOString()
      })

      console.log('[AuthService] Signup complete — user, studio, member created')
      return { user: { id: userId, email: validated.email }, studio }
    } catch (err) {
      console.error('[Signup] DB phase failed:', err)
      throw err
    }
  }

  static async login(supabase: any, input: unknown) {
    console.log('[AuthService] Initiating login for:', (input as any)?.email)
    const validated = loginSchema.parse(input)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password
    })
    console.log('[AuthService] Login attempt finished. Error:', authError?.message)

    if (authError) throw authError
    if (!authData?.user) throw Errors.unauthorized()

    // Fetch member and studio info (same as me())
    const { data: member, error: memberError } = await supabase
      .from('studio_members')
      .select('*, studios (*)')
      .eq('user_id', authData.user.id)
      .single()

    if (memberError || !member) {
      // User exists in auth but has no studio — return user only
      return { user: authData.user, studio: null, member: null }
    }

    const studioData = Array.isArray((member as any).studios)
      ? (member as any).studios[0]
      : (member as any).studios

    return {
      user: authData.user,
      member: {
        ...member,
        studios: undefined
      },
      studio: studioData
    }
  }

  static async logout(supabase: any) {
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !data?.session) {
      console.log('[AuthService] Logout called without active session, skipping signOut')
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async resetPassword(supabase: any, email: string) {
    const admin = createAdminClient()

    // Use Admin API to generate recovery link (no SMTP needed)
    const { data: linkData, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    })

    if (error) {
      console.error('[AuthService] Reset password error:', error)
      throw error
    }

    if (linkData?.properties?.action_link) {
      console.log('--- password reset link ---')
      console.log(linkData.properties.action_link)
      console.log('---------------------------')
    }
  }

  static async updatePassword(supabase: any, input: unknown) {
    const validated = updatePasswordSchema.parse(input)
    const { error } = await supabase.auth.updateUser({
      password: validated.password
    })
    if (error) throw error
  }

  static async updateMe(supabase: any, input: unknown) {
    const validated = updateMeSchema.parse(input)
    const { data, error: authError } = await supabase.auth.getUser()
    const user = data?.user
    if (authError || !user) throw Errors.unauthorized()

    const member = await getMemberByUserId(supabase, user.id)
    if (!member) throw Errors.forbidden()

    const admin = createAdminClient()
    const now = new Date().toISOString()

    const nextMetadata = {
      ...(user.user_metadata ?? {}),
    } as Record<string, unknown>

    if (validated.full_name !== undefined) nextMetadata.full_name = validated.full_name
    if (validated.preferred_language !== undefined) nextMetadata.preferred_language = validated.preferred_language
    if (validated.designation !== undefined) nextMetadata.designation = validated.designation

    if (
      validated.full_name !== undefined ||
      validated.preferred_language !== undefined ||
      validated.designation !== undefined
    ) {
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(user.id, {
        user_metadata: nextMetadata,
      })
      if (authUpdateError) throw authUpdateError
    }

    const memberUpdate: Record<string, unknown> = {
      updated_at: now,
    }
    if (validated.full_name !== undefined) memberUpdate.display_name = validated.full_name
    if (validated.phone !== undefined) memberUpdate.phone = validated.phone
    if (validated.whatsapp !== undefined) memberUpdate.whatsapp = validated.whatsapp

    if (Object.keys(memberUpdate).length > 1) {
      const { error: memberUpdateError } = await admin
        .from('studio_members')
        .update(memberUpdate)
        .eq('id', member.member_id)
        .eq('user_id', user.id)

      if (memberUpdateError) {
        throw Errors.validation('Failed to update member profile')
      }
    }

    if (validated.full_name !== undefined) {
      const { error: userUpdateError } = await admin
        .from('users')
        .update({
          full_name: validated.full_name,
          updated_at: now,
        } as any)
        .eq('id', user.id)

      if (userUpdateError) {
        throw Errors.validation('Failed to update user profile')
      }
    }

    return this.me(supabase)
  }

  static async me(supabase: any) {
    const { data, error: authError } = await supabase.auth.getUser()
    const user = data?.user
    if (authError || !user) throw Errors.unauthorized()

    // Fetch member and studio info
    const { data: member, error: memberError } = await supabase
      .from('studio_members')
      .select('*, studios (*)')
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) throw Errors.forbidden()

    const studioData = Array.isArray((member as any).studios)
      ? (member as any).studios[0]
      : (member as any).studios

    return {
      user,
      member: {
        ...member,
        studios: undefined
      },
      studio: studioData
    }
  }

  static async requestWhatsAppOtp(supabase: any, phone: string) {
    console.log('[AuthService] Requesting WhatsApp OTP for:', phone)
    const admin = createAdminClient()
    const validPhone = phone.replace(/^\+91/, '').replace(/\D/g, '')

    const { error } = await admin.auth.signInWithOtp({
      phone: `+91${validPhone}`,
      options: {
        channel: 'whatsapp',
      }
    });

    if (error) {
      console.error('[AuthService] OTP Request Error:', error.message)
      throw error;
    }

    return { success: true };
  }

  static async verifyWhatsAppOtp(supabase: any, phone: string, token: string) {
    console.log('[AuthService] Verifying WhatsApp OTP for:', phone)
    const validPhone = phone.replace(/^\+91/, '').replace(/\D/g, '')

    const { data: authData, error } = await supabase.auth.verifyOtp({
      phone: `+91${validPhone}`,
      token,
      type: 'sms', // Supabase handles WhatsApp OTPs using the 'sms' token type natively
    });

    if (error) {
      console.error('[AuthService] OTP Verify Error:', error.message)
      throw error;
    }

    if (!authData?.user) throw Errors.unauthorized()

    // Lookup existing member
    const { data: member, error: memberError } = await supabase
      .from('studio_members')
      .select('*, studios (*)')
      .eq('user_id', authData.user.id)
      .single()

    if (memberError || !member) {
      return { user: authData.user, studio: null, member: null }
    }

    const studioData = Array.isArray((member as any).studios)
      ? (member as any).studios[0]
      : (member as any).studios

    return {
      user: authData.user,
      member: {
        ...member,
        studios: undefined
      },
      studio: studioData
    }
  }
}
