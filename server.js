'use strict'

const fs = require(`fs`)
const randomstring = require(`randomstring`)
const http = require(`http`)
const WebSocket = require('ws')
const uuid = require('uuid/v4')

process.setMaxListeners(0)

const ecstatic = require(`ecstatic`)(`${__dirname}/static`)
const socks = {}

function genRandString() {
  return randomstring.generate({
    length: 3,
    capitalization: `lowercase`
  })
}

function callback(req, res) {
  const path = req.url

  // index
  if (/^\/$/.test(path)) {
    let Location = null

    // generate different path id if already being used
    do {
      const randString = genRandString()
      Location = `/${randString}`
    } while (socks[Location] && socks[Location]._clients.length)

    res.writeHead(301, {Location})
    res.end()
    return
  }

  // assets
  if (/\.+/.test(path)) {
    ecstatic.apply(this, arguments)
  } else {
    if (!socks[path]) {
      socks[path] = createSock(path)
    }

    const stream = fs.createReadStream(`${__dirname}/static/index.html`)
    stream.pipe(res)
  }
}

function createSock(path) {
  const clients = []

  const sock = new WebSocket.Server({
    server,
    path
  })

  sock.on(`connection`, conn => {
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
      console.log('received: %s', data)
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
  })

  sock._clients = clients

  return sock
}


const server = http.createServer(callback)
const port = process.env.PORT || 8956

server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
