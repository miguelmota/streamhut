const fs = require('fs')
const Gun = require('gun')

function start() {
  const config = {
    port: process.env.GUNDB_PORT || 8765
  }

  if (process.env.HTTPS_KEY) {
    config.key = fs.readFileSync(process.env.HTTPS_KEY)
    config.cert = fs.readFileSync(process.env.HTTPS_CERT)
    config.server = require('https').createServer(config, Gun.serve(__dirname))
  } else {
    config.server = require('http').createServer(Gun.serve(__dirname))
  }

  const gun = Gun({
    web: config.server.listen(config.port)
  })

  console.log(`         GunDB port: ${config.port}`)
}

module.exports.start = start