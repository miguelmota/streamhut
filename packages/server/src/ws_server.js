const uuid = require('uuid/v4')
const {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} = require('arraybuffer-mime')
const { app } = require('./http_server')
const socks = require('./socks')
const {
  readStreamLogs,
  readStreamMessages,
  insertStreamLog,
  insertStreamMessage
} = require('./db')

function createSock (conn, pathname, clients=[]) {
  if (!conn.id) {
    conn.id = uuid()
  }

  clients.push(conn)

  console.log(`connected ${conn.id} ${pathname}`)

  const sendConnections = () => {
    clients.forEach(client => {
      client.send(JSON.stringify({
        __server_message__: {
        data: {
          connectionId: client.id,
          connections: clients.filter(x => (x.id !== client.id))
          .map(x => ({id: x.id}))
        }
      }}))

      ;(async ()=> {
        var logs = await readStreamLogs(pathname)
        if (logs) {
          for (var i = 0; i < logs.length; i++) {
            const mime = 'shell'
            const abWithMime = arrayBufferWithMime(logs[i].data, mime)
            client.send(abWithMime)
          }
        }

        var logs = await readStreamMessages(pathname)
        if (logs) {
          for (var i = 0; i < logs.length; i++) {
            const abWithMime = arrayBufferWithMime(logs[i].message, logs[i].mime)
            client.send(abWithMime)
          }
        }
      })()
    })
  }

  sendConnections()

  conn.on('message', data => {
    console.log('received data')
    //console.log('received: %s', data)
    //console.log(`\n${pathname}\n---${data}---`)

    const {mime, arrayBuffer} = arrayBufferMimeDecouple(data)
    insertStreamMessage(pathname, Buffer.from(arrayBuffer), mime)

    clients.forEach(client => {
      console.log(`Streaming to ${client.id} ${pathname}`)
      client.send(data)
    })
  })
  .on('close', () => {
    console.log(`close ${conn.id}`)

    const index = clients.reduce((index, client, i) => {
      if (conn.id === client.id) {
        return i
      }

      return index
    }, -1)

    if (index > -1) {
      clients.splice(index, 1)
    }

    sendConnections()
  })
  .on('error', (error) => {
    console.error(error)
  })

  return clients
}

app.ws('/ws/s/*', (conn, req) => {
  const pathname = req.url.replace(/.*\/s\/(\w+)\/?.*/, '$1')
  console.log('connected:', pathname)

  socks[pathname] = createSock(conn, pathname, socks[pathname])
})

module.exports.server = app
