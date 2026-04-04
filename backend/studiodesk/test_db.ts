
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('studios')
    .insert({
      name: 'Test Studio',
      slug: 'test-studio-' + Date.now(),
      email: 'test@example.com',
      plan_tier: 'starter',
      subscription_status: 'trialing',
      is_active: true
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
