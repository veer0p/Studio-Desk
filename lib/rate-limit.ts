import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// This uses a Supabase RPC function 'check_rate_limit'
// SQL for the function:
/*
create table if not exists public.rate_limits (
    key text primary key,
    count integer default 0,
    last_attempt timestamp with time zone default now()
);

create or replace function check_rate_limit(
    p_key text, 
    p_limit integer, 
    p_window_seconds integer
) returns boolean as $$
declare
    v_count integer;
    v_last timestamp with time zone;
begin
    select count, last_attempt into v_count, v_last 
    from public.rate_limits 
    where key = p_key;

    if not found then
        insert into public.rate_limits (key, count, last_attempt)
        values (p_key, 1, now());
        return true;
    end if;

    if v_last < now() - (p_window_seconds || ' seconds')::interval then
        update public.rate_limits 
        set count = 1, last_attempt = now()
        where key = p_key;
        return true;
    end if;

    if v_count < p_limit then
        update public.rate_limits 
        set count = v_count + 1, last_attempt = now()
        where key = p_key;
        return true;
    end if;

    return false;
end;
$$ language plpgsql security definer;
*/

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function rateLimit(key: string, limit: number = 20, windowSeconds: number = 60): Promise<boolean> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set - rate limiting disabled');
    return true;
  }

  const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds
  });

  if (error) {
    console.error('Rate limit error:', error);
    return true; // Fail open to avoid blocking users on DB errors
  }

  return !!data;
}
