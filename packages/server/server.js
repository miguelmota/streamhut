'use strict'

const path = require('path')
const fs = require('fs')
const randomstring = require('randomstring')
const http = require('http')
const WebSocket = require('ws')
const net = require('net')
const uuid = require('uuid/v4')
const {
  arrayBufferWithMime,
} = require('arraybuffer-mime')

process.setMaxListeners(0)

const ecstatic = require('ecstatic')(path.resolve(__dirname, '..', 'web/build'))
const socks = {}

function genRandString() {
  return randomstring.generate({
    length: 3,
    charset: 'alphabetic',
    capitalization: 'lowercase',
    readable: true
  })
}

function getRandUnusedPath() {
  let location = null

  // generate different path id if already being used
  do {
    const randString = genRandString()
    location = `/${randString}`
  } while (socks[location])

  return location
}

function callback(req, res) {
  const pathname = req.url

  // index
  if (/^\/$/.test(pathname)) {
    const Location = getRandUnusedPath()

    res.writeHead(301, {Location})
    res.end()
    return
  }

  // assets
  if (/\.+/.test(pathname)) {
    ecstatic.apply(this, arguments)
  } else {
    const stream = fs.createReadStream(path.resolve(__dirname, '..', 'web/build/index.html'))
    stream.pipe(res)
  }
}

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
    })
  }

  sendConnections()

  conn.on('message', data => {
    console.log('received data')
    //console.log('received: %s', data)
    //console.log(`\n${pathname}\n---${data}---`)

    clients.forEach(client => {
      console.log(`Streaming to ${client.id} ${pathname}`)
      client.send(data)
    })
  })

  conn.on(`close`, function() {
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

  return clients
}

function start(props = {}) {
  const port = parseInt(props.port || process.env.PORT || 8956, 10)
  const server = http.createServer(callback)

  server.listen(port, () => {
    console.log(`HTTP/WebSocket server on port: ${port}`)
  })

  const sock = new WebSocket.Server({
    server
  })

  sock.on(`connection`, (conn, IncMsg) => {
    const pathname = IncMsg.url

    socks[pathname] = createSock(conn, pathname, socks[pathname])
  })

  const netPort = parseInt(process.env.NET_PORT || (port + 1), 10)

  const netConnections = {}

  // netcat server
  const netServer = net.createServer((socket) => {
    if (!socket.id) {
      socket.id = uuid()
    }

    const pathname = getRandUnusedPath()
    netConnections[pathname] = socket

    const info = socket.address()
    let address = info.address.split(':').splice(-1, 1)[0]

    if (!address || address === '1') {
      address = '127.0.0.1'
    }

    const hostUrl = process.env.HOST_URL || `http://${address}:${port}`

    const url = `Streaming to: ${hostUrl}${pathname}`

    socket.write(`${url}\n`)

      socket.pipe(socket)
    socket.on('data', (buffer) => {
      const clients = socks[pathname]

      if (clients) {
        clients.forEach(client => {
          console.log(`streaming to ${client.id} ${pathname}`)
          const mime = 'shell'
          const abWithMime = arrayBufferWithMime(buffer.buffer, mime)
          client.send(abWithMime)
        })
      }
    })
  })

  netServer.listen(netPort, () => {
    console.log(`                  Netcat port: ${netPort}`)
  })
}

module.exports = { start }
