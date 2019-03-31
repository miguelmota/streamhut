const config = require('./config')
const tcpServer = require('./tcp_server')
const httpServer = require('./http_server')
const gundb = require('./gundb')

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
  gundb.start()
}

if (require.main === module) {
  start()
}

module.exports.start = start
