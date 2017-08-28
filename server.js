'use strict'

const fs = require(`fs`)
const randomstring = require(`randomstring`)
const http = require(`http`)
const WebSocket = require('ws')
const net = require('net')
const uuid = require('uuid/v4')
const {
  arrayBufferWithMime,
} = require('arraybuffer-mime')

process.setMaxListeners(0)

const ecstatic = require(`ecstatic`)(`${__dirname}/static`)
const socks = {}

function genRandString() {
  return randomstring.generate({
    length: 3,
    capitalization: `lowercase`
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
  const path = req.url

  // index
  if (/^\/$/.test(path)) {
    const Location = getRandUnusedPath()

    res.writeHead(301, {Location})
    res.end()
    return
  }

  // assets
  if (/\.+/.test(path)) {
    ecstatic.apply(this, arguments)
  } else {
    const stream = fs.createReadStream(`${__dirname}/static/index.html`)
    stream.pipe(res)
  }
}

function createSock(conn, path, clients=[]) {
  if (!conn.id) {
    conn.id = uuid()
  }

  clients.push(conn)

  console.log(`connected ${conn.id} ${path}`)

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
    //console.log(`\n${path}\n---${data}---`)
    clients.forEach(client => {
      console.log(`streaming to ${client.id} ${path}`)
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

const server = http.createServer(callback)
const port = process.env.PORT || 8956

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

const sock = new WebSocket.Server({
  server
})

sock.on(`connection`, (conn, IncMsg) => {
  const path = IncMsg.url

  socks[path] = createSock(conn, path, socks[path])
})

const netPort = process.env.NET_PORT || 8957

const netConnections = {}

// netcat server
const netServer = net.createServer((socket) => {
  if (!socket.id) {
    socket.id = uuid()
  }

  const info = socket.address()
  const address = info.address.split(':').splice(-1, 1)

  const path = getRandUnusedPath()
  netConnections[path] = socket

  const url = `Streaming to: http://${address}:${port}${path}`

  socket.write(`${url}\n`)

  socket.on('data', (buffer) => {
    const clients = socks[path]

    if (clients) {
      clients.forEach(client => {
        console.log(`streaming to ${client.id} ${path}`)
        const mime = 'shell'
        const abWithMime = arrayBufferWithMime(buffer.buffer, mime)
        client.send(abWithMime)
      })
    }
  })
})

netServer.listen(netPort, () => {
  console.log(`Net server listening on port ${netPort}`)
})
