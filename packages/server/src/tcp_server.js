'use strict'

const randomstring = require('randomstring')
const net = require('net')
const uuid = require('uuid/v4')
const {
  arrayBufferWithMime,
} = require('arraybuffer-mime')
const { server } = require('./ws_server')
const { netPort } = require('./config')
const reservedWords = require('./reserved_words.json')

process.setMaxListeners(0)

const socks = {}

function genRandString() {
  return randomstring.generate({
    length: 3,
    charset: 'alphabetic',
    capitalization: 'lowercase',
    readable: true
  })
}

function channelTaken(s) {
  return !!socks[s]
}

function isReserved(s) {
  s = s.toLowerCase().trim()
  return reservedWords.indexOf(s) > -1
}

function normalizeChannel(s) {
  s = s.toLowerCase().trim()
  if (isReserved(s)) {
    s = s+'1'
  }

  return s
}

function getRandomChannel() {
  let location = null

  // generate different path id if already being used
  do {
    const randString = genRandString()
    location = randString
  } while (socks[location] && !isReserved(location))

  return location
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

const sock = server

sock.on('connection', (conn, IncMsg) => {
  const pathname = IncMsg.url.substr(1)
  console.log('connected', pathname)

  socks[pathname] = createSock(conn, pathname, socks[pathname])
})

const netConnections = {}

// netcat server
const netServer = net.createServer((socket) => {
  if (!socket.id) {
    socket.id = uuid()
  }

  let channel = null

  const info = socket.address()
  let address = info.address.split(':').splice(-1, 1)[0]

  if (!address || address === '1') {
    address = '127.0.0.1'
  }

  const hostUrl = process.env.HOST_URL || `http://${address}:${port}`

  socket.pipe(socket)

  let line = 0
  let expired = false
  setTimeout(() => {
    expired = true

    if (!channel) {
      channel = getRandomChannel()
    }

    netConnections[channel] = socket
    const url = `${hostUrl}/${channel}`
    socket.write(`Streaming to: ${url}\n\r`)
  }, 5)

  socket.on('data', (buffer) => {
    if (line == 0 && !expired) {
      let data = buffer.toString()
      if (data[0] === '#') {
        const re = /#([a-zA-Z0-9]+)\n?\r?/
        const matches = data.match(re)
        if (matches.length > 1) {
          channel = normalizeChannel(matches[1])
          line++
          return
        }
      }
    }

    const clients = socks[channel]

    if (clients) {
      clients.forEach(client => {
        console.log(`streaming to ${client.id} ${channel}`)
        const mime = 'shell'
        const abWithMime = arrayBufferWithMime(buffer.buffer, mime)
        client.send(abWithMime)
      })
    }
  })
  .on('error', (error) => {
    console.error(error)
  })

})

function start() {
  netServer.listen({
    hostname: '0.0.0.0',
    port: netPort
  }, () => {
    console.log(`           TCP port: ${netPort}`)
  })
}

module.exports = { start }
