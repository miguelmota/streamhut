const config = require('./config')
const httpServer = require('./http_server')
const wsServer = require('./ws_server')
const tcpServer = require('./tcp_server')

function start(conf) {
  if (!conf) {
    conf = {}
  }

  if (conf.port) {
    config.port = conf.port
  }
  if (conf.netPort) {
    config.netPort = conf.netPort
  }

  httpServer.start()
  tcpServer.start()
}

if (require.main === module) {
  start()
}

module.exports.start = start
