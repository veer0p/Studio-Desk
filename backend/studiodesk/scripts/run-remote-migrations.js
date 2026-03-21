const { Client } = require('ssh2')
const fs = require('fs')
const path = require('path')

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
const files = [
  'studiodesk_schema_v2.sql',
  'studiodesk_schema_v2_fixes.sql',
  '20250101000003_fix_rls_performance.sql',
  '20250317120000_studio_invitations_updated_at.sql'
]

const sql = files.map(f => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n')

const conn = new Client()
conn
  .on('ready', () => {
    console.log('Client :: ready')
    // We'll use a temporary file on the VPS to run the SQL
    const remotePath = '/tmp/migration.sql'
    
    conn.sftp((err, sftp) => {
      if (err) throw err
      const stream = sftp.createWriteStream(remotePath)
      stream.on('close', () => {
        console.log('Uploaded migration.sql')
        conn.exec(`docker cp ${remotePath} supabase-db:/tmp/migration.sql && docker exec supabase-db psql -U postgres -d postgres -f /tmp/migration.sql`, (err, stream) => {
          if (err) throw err
          stream
            .on('close', (code) => {
              console.log('Migration finished with code ' + code)
              conn.end()
            })
            .on('data', (data) => console.log('STDOUT: ' + data))
            .stderr.on('data', (data) => console.log('STDERR: ' + data))
        })
      })
      stream.end(sql)
    })
  })
  .connect({ host: '144.91.101.255', port: 22, username: 'root', password: 'Veeridk1' })
