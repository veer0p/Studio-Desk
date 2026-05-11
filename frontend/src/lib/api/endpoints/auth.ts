import { http } from '@/lib/api/client';
import type { MeResponse } from '@/types/domain';
import type { LoginInput, SignupInput } from '@/lib/validations/auth.schema';
import type { ApiSuccessEnvelope } from '@/types/api';

/** Map raw Supabase User + member/studio to our simplified MeResponse shape. */
function mapMe(raw: { user: any; member: any; studio: any }): MeResponse {
  return {
    user: {
      id: raw.user.id,
      email: raw.user.email ?? '',
      full_name: raw.user.user_metadata?.full_name ?? raw.member?.display_name ?? '',
      phone: raw.member?.phone ?? raw.user.phone ?? null,
      designation: raw.user.user_metadata?.designation ?? null,
    },
    member: raw.member ?? null,
    studio: raw.studio ?? null,
  };
}

export async function authLogin(data: LoginInput): Promise<MeResponse> {
  const body = await http.post('auth/login', { json: data }).json<ApiSuccessEnvelope<any>>();
  return mapMe(body.data);
}

export async function authSignup(data: SignupInput): Promise<{ user: { id: string; email: string }; studio: any }> {
  const body = await http.post('auth/signup', { json: data }).json<ApiSuccessEnvelope<any>>();
  return body.data;
}

export async function authMe(): Promise<MeResponse> {
  const body = await http.get('auth/me').json<ApiSuccessEnvelope<any>>();
  return mapMe(body.data);
}

export async function authLogout(): Promise<void> {
  await http.post('auth/logout').json();
}

export async function authForgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const body = await http.post('auth/forgot-password', { json: { email } }).json<ApiSuccessEnvelope<any>>();
  return body.data;
}

export async function authUpdatePassword(password: string): Promise<void> {
  await http.post('auth/update-password', { json: { password } }).json();
}
