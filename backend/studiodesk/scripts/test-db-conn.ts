import { Client } from 'pg'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const connectionString = `postgres://postgres:Veeridk1@144.91.101.255:5432/postgres`

async function test() {
  const client = new Client({ connectionString })
  try {
    await client.connect()
    console.log('Connected to Postgres!')
    const res = await client.query('SELECT count(*) FROM auth.users')
    console.log('User count:', res.rows[0].count)
    await client.end()
  } catch (err) {
    console.error('Connection failed:', err)
  }
}

test()
