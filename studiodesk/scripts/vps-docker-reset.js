const { Client } = require('ssh2')
const conn = new Client()
conn
  .on('ready', () => {
    console.log('Client :: ready')
    // We'll use a complex command to find all tables and truncate them
    const truncateCmd = `docker exec supabase-db psql -U postgres -d postgres -c "
      DO \\\\$\\$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END \\\\$\\$ ;
    "`
    
    // Also clear auth.users
    const clearAuthCmd = `docker exec supabase-db psql -U postgres -d postgres -c "TRUNCATE auth.users CASCADE;"`

    conn.exec(truncateCmd + ' && ' + clearAuthCmd, (err, stream) => {
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
