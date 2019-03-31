const port = parseInt(process.env.PORT || 8956, 10)
const netPort = parseInt(process.env.NET_PORT || (port + 1), 10)

module.exports.port = port
module.exports.netPort = netPort
