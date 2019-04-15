'use strict'

const randomstring = require('randomstring')
const net = require('net')
const uuid = require('uuid/v4')
const {
  arrayBufferWithMime,
} = require('arraybuffer-mime')
const { server } = require('./ws_server')
const { port, netPort } = require('./config')
const socks = require('./socks')
const { insertStreamLog } = require('./db')
const { isValidChannelName, normalizeChannel, isReservedKeyword } = require('./helpers')
const url = require('url')

process.setMaxListeners(0)

function genRandString() {
  return randomstring.generate({
    length: 6,
    charset: 'alphabetic',
    capitalization: 'lowercase',
    readable: true
  })
}

function channelTaken(s) {
  return !!socks[s]
}

function getRandomChannel() {
  let location = null

  // generate different path id if already being used
  do {
    const randString = genRandString()
    location = randString
  } while (socks[location] && !isValidChannelName(location))

  return location
}

function getShareUrl(address, port, channel) {
  address = address.split(':').splice(-1, 1)[0]

  if (!address || address === '1') {
    address = '127.0.0.1'
  }

  const hostUrl = process.env.HOST_URL || `http://${address}:${port}`
  const {protocol,host} = url.parse(hostUrl)
  let pathname = `s/${channel}`
  if (host === 'stream.ht') {
    pathname = channel
  }

  return `${protocol}//${host}/${pathname}`
}

const netConnections = {}

// netcat server
const netServer = net.createServer((socket) => {
  if (!socket.id) {
    socket.id = uuid()
  }

  let channel = null

  const info = socket.address()

  socket.pipe(socket)

  let line = 0
  let expired = false
  setTimeout(() => {
    expired = true

    if (!channel) {
      channel = getRandomChannel()
    }

    netConnections[channel] = socket
    const shareUrl = getShareUrl(info.address, port, channel)
    socket.write(`streamhut: streaming to ${shareUrl}\n\r`)
  }, 5)

  socket.on('data', async (buffer) => {
    if (line == 0 && !expired) {
      let data = buffer.toString()
      if (data[0] === '#') {
        const re = /#([a-zA-Z0-9]+)\n?\r?/
        const matches = data.match(re)
        if (matches.length > 1) {
          channel = normalizeChannel(matches[1])
          if (!isValidChannelName(channel)) {
            socket.write(`streamhut: channel name "${channel}" is not available`)
            socket.end()
            return
          }
          line++
          return
        }
      }
    }

    if (!channel) {
      return
    }

    const mime = 'shell'
    const abWithMime = arrayBufferWithMime(buffer.buffer, mime)
    insertStreamLog(channel, buffer)

    const clients = socks[channel]

    if (clients) {
      clients.forEach(client => {
        console.log(`streaming to ${client.id} ${channel}`)
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
