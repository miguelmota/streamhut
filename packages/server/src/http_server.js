const http = require('http')
const path = require('path')
const fs = require('fs')
const { port } = require('./config')

const ecstatic = require('ecstatic')(path.resolve(__dirname, '..', 'build'))

function callback(req, res) {
  const pathname = req.url

  // assets
  if (/\.+/.test(pathname)) {
    ecstatic.apply(this, arguments)
  } else {
    // index
    const stream = fs.createReadStream(path.resolve(__dirname, '..', 'build/index.html'))
    stream.pipe(res)
  }
}

const server = http.createServer(callback)

function start() {
  server.listen(port, () => {
    console.log(`HTTP/WebSocket port: ${port}`)
  })
}

module.exports.server = server
module.exports.start = start
