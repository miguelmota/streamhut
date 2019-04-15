const port = parseInt(process.env.PORT, 10) || 9000
const netPort = parseInt(process.env.NET_PORT, 10) || 1337

module.exports.port = port
module.exports.netPort = netPort
