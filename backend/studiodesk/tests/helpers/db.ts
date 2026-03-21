import { createAdminClient } from '@/lib/supabase/admin'
import { Client } from 'pg'

type Where = Record<string, string | number | boolean | null>

function withWhere(query: any, where?: Where) {
  if (!where) return query
  let q = query
  for (const [key, value] of Object.entries(where)) {
    if (value === null) q = q.is(key, null)
    else q = q.eq(key, value)
  }
  return q
}

export async function getRow(table: string, where?: Where) {
  const admin = createAdminClient()
  // @ts-expect-error: residual strict constraint
  const query = withWhere(admin.from(table).select('*').limit(1), where)
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function getCount(table: string, where?: Where): Promise<number> {
  const admin = createAdminClient()
  // @ts-expect-error: residual strict constraint
  const query = withWhere(admin.from(table).select('*', { count: 'exact', head: true }), where)
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

export async function getRaw(sql: string): Promise<Record<string, unknown>[]> {
  const connectionString =
    process.env.SUPABASE_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
  const client = new Client({ connectionString })
  await client.connect()
  try {
    const result = await client.query(sql)
    return result.rows
  } finally {
    await client.end()
  }
}
