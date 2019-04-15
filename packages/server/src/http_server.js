const http = require('http')
const path = require('path')
const fs = require('fs')
const enableWs = require('express-ws')

const { port } = require('./config')

const ecstatic = require('ecstatic')(path.resolve(__dirname, '..', 'build'))

const express = require('express')
const app = express()
enableWs(app)

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('/api/v1/health', (req, res) => res.send('OK'))

app.get('/api/v1/stream/:channel', (req, res) => {
  res.json({'foo':"bar"})
})

// "/" or "/s/:channel"
app.get(/^(\/|\/s\/\w+)$/, function(req, res) {
  if (req.url.indexOf('.websocket') > 0) {
    res.sendStatus(200)
    return
  }

  res.sendFile(path.resolve(__dirname, '..', 'build/index.html'))
})

// redirect "/{channel}" to "/s/{channel}"
app.get(/^\/(\w+)$/, function(req, res) {
  res.redirect(`/s/${req.params[0]}`)
})

const server = http.createServer(app)

function start() {
  app.listen(port, () => {
    console.log(`HTTP/WebSocket port: ${port}`)
  })
}

module.exports.app = app
module.exports.server = server
module.exports.start = start
