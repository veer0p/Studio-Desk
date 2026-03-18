import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Razorpay
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  // Communication
  RESEND_API_KEY: z.string().min(1),
  WHATSAPP_API_KEY: z.string().min(1),
  WHATSAPP_API_BASE_URL: z.string().url().default('https://api.interakt.ai'),

  // External Services
  IMMICH_BASE_URL: z.string().url(),
  IMMICH_API_KEY: z.string().min(1),

  // Security
  ENCRYPTION_KEY: z.string().length(64).regex(/^[0-9a-fA-F]+$/, 'Must be a 64-character hex string'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

const parseResult = envSchema.safeParse(process.env)

if (!parseResult.success) {
  const missingVars = parseResult.error.issues.map((issue) => issue.path.join('.')).join(', ')
  throw new Error(`❌ Invalid environment variables: ${missingVars}. Please check your .env file.`)
}

export const env = parseResult.data
