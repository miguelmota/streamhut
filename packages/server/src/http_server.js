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

app.get('/', function(req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'build/index.html'))
})

app.get('/s/.*', function(req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'build/index.html'))
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
