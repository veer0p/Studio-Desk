const { Client } = require('ssh2')
const fs = require('fs')

const conn = new Client()
conn
  .on('ready', () => {
    console.log('Client :: ready')
    conn.exec('cd /root/studiodesk && npx supabase db reset', (err, stream) => {
      if (err) throw err
      stream
        .on('close', (code, signal) => {
          console.log('Stream :: close :: code: ' + code + ', signal: ' + signal)
          conn.end()
        })
        .on('data', (data) => {
          console.log('STDOUT: ' + data)
        })
        .stderr.on('data', (data) => {
          console.log('STDERR: ' + data)
        })
    })
  })
  .connect({
    host: '144.91.101.255',
    port: 22,
    username: 'root',
    password: 'Veeridk1'
  })
