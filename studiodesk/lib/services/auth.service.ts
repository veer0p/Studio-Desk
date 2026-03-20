import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'
import { studioRepo } from '@/lib/repositories/studio.repo'
import { teamRepo } from '@/lib/repositories/team.repo'
import { signupSchema, loginSchema, updatePasswordSchema } from '@/lib/validations/auth.schema'

export class AuthService {
  static async signup(supabase: SupabaseClient<Database>, input: unknown) {
    const validated = signupSchema.parse(input)

    // 1. Sign up user in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.fullName
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw Errors.unauthorized()

    const userId = authData.user.id

    try {
      // 2. Create Studio
      const studio = await studioRepo.createStudio(supabase, {
        name: validated.studioName,
        slug: validated.studioSlug,
        email: validated.email
      })

      // 3. Create Owner Member
      await teamRepo.createMember(supabase, {
        studio_id: studio.id,
        user_id: userId,
        role: 'owner',
        display_name: validated.fullName,
        accepted_at: new Date().toISOString()
      })

      return { user: authData.user, studio }
    } catch (err) {
      // Cleanup auth user if studio creation fails (pseudo-transactional)
      // Note: In production, use a database function or handle carefully
      console.error('[Signup] Phase 2 failed, user exists in Auth but not in DB:', err)
      throw err
    }
  }

  static async login(supabase: SupabaseClient<Database>, input: unknown) {
    const validated = loginSchema.parse(input)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password
    })

    if (error) throw error
    return data
  }

  static async logout(supabase: SupabaseClient<Database>) {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async resetPassword(supabase: SupabaseClient<Database>, email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`
    })
    if (error) throw error
  }

  static async updatePassword(supabase: SupabaseClient<Database>, input: unknown) {
    const validated = updatePasswordSchema.parse(input)
    const { error } = await supabase.auth.updateUser({
      password: validated.password
    })
    if (error) throw error
  }

  static async me(supabase: SupabaseClient<Database>) {
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
