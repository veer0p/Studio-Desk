const { Client } = require('ssh2')
const conn = new Client()
conn
  .on('ready', () => {
    console.log('Client :: ready')
    // Drop and create public schema to reset
    const resetCmd = `docker exec supabase-db psql -U postgres -d postgres -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO anon; GRANT ALL ON SCHEMA public TO authenticated; GRANT ALL ON SCHEMA public TO service_role;"`
    
    // Also clear auth.users
    const clearAuthCmd = `docker exec supabase-db psql -U postgres -d postgres -c "TRUNCATE auth.users CASCADE;"`

    conn.exec(resetCmd + ' && ' + clearAuthCmd, (err, stream) => {
      if (err) throw err
      stream
        .on('close', (code) => {
          console.log('Reset command finished with code ' + code)
          conn.end()
        })
        .on('data', (data) => console.log('STDOUT: ' + data))
        .stderr.on('data', (data) => console.log('STDERR: ' + data))
    })
  })
  .connect({ host: '144.91.101.255', port: 22, username: 'root', password: 'Veeridk1' })
