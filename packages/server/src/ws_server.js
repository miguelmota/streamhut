const WebSocket = require('ws')
const { server } = require('./http_server')

module.exports.server = new WebSocket.Server({
  server: server
})
