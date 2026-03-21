const { Client } = require('ssh2')
const conn = new Client()
conn
  .on('ready', () => {
    console.log('Client :: ready')
    conn.exec('ls -F ~ && ls -F /', (err, stream) => {
      if (err) throw err
      stream
        .on('close', () => conn.end())
        .on('data', (data) => console.log('STDOUT: ' + data))
    })
  })
  .connect({ host: '144.91.101.255', port: 22, username: 'root', password: 'Veeridk1' })
