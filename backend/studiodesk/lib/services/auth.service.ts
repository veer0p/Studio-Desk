import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { teamRepo } from '@/lib/repositories/team.repo'
import { createAdminClient } from '@/lib/supabase/admin'
import { signupSchema, loginSchema, updatePasswordSchema } from '@/lib/validations/auth.schema'

export class AuthService {
  static async signup(supabase: any, input: unknown) {
    console.log('[AuthService] Initiating signup for:', (input as any)?.email)
    const validated = signupSchema.parse(input)
    console.log('[AuthService] Validation success for:', validated.email)

    const admin = createAdminClient()

    // 1. Create user via Admin API (auto-confirms email, no SMTP needed)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: {
        full_name: validated.fullName,
      },
    })

    if (authError) {
      console.error('[AuthService] Auth signup error:', authError)
      // Detect duplicate user
      if (authError.message?.toLowerCase().includes('already registered') ||
        authError.message?.toLowerCase().includes('already been registered') ||
        (authError as any).status === 422) {
        throw Errors.conflict('An account with this email already exists')
      }
      throw authError
    }
    if (!authData.user) throw Errors.unauthorized()
    console.log('[AuthService] Auth user created (auto-confirmed):', authData.user.id)

    const userId = authData.user.id

    try {
      // 2. Create Studio (use admin client since user has no session yet)
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
      return { user: authData.user, studio }
    } catch (err) {
      console.error('[Signup] Phase 2 failed, user exists in Auth but not in DB:', err)
      throw err
    }
  }

  static async login(supabase: any, input: unknown) {
    console.log('[AuthService] Initiating login for:', (input as any)?.email)
    const validated = loginSchema.parse(input)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password
    })
    console.log('[AuthService] Login attempt finished. Error:', error?.message)

    if (error) throw error
    if (!data.user) throw Errors.unauthorized()

    // Fetch member and studio info (same as me())
    const { data: member, error: memberError } = await supabase
      .from('studio_members')
      .select('*, studios (*)')
      .eq('user_id', data.user.id)
      .single()

    if (memberError || !member) {
      // User exists in auth but has no studio — return user only
      return { user: data.user, studio: null, member: null }
    }

    return {
      user: data.user,
      member: {
        ...member,
        studios: undefined
      },
      studio: (member as any).studios
    }
  }

  static async logout(supabase: any) {
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

  static async me(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw Errors.unauthorized()

    // Fetch member and studio info
    const { data: member, error: memberError } = await supabase
      .from('studio_members')
      .select('*, studios (*)')
      .eq('user_id', user.id)
      .single()

    if (memberError || !member) throw Errors.forbidden()

    return {
      user,
      member: {
        ...member,
        studios: undefined
      },
      studio: (member as any).studios
    }
  }
}
