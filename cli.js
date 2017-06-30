const fs = require('fs')
const program = require('commander')
const WebSocket = require('ws')
const {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} = require('arraybuffer-mime')

const packageJson = require('./package.json')

const art = fs.readFileSync('./hut.txt', 'utf8')

if (process.argv.indexOf('--help') > -1 &&
  process.argv.length === 3) {
  console.log(art)
}

program
  .version(packageJson.version)
  .option('-h, --host <host>', 'host URL', null, null)
  .option('--not-secure', 'not using SSL.', null, false)
  .option('-c, --channel <id>', 'channel ID', null, null)
  .option('-t, --text <text>', 'text to send', null, null)
  .option('-f, --file <filepath>', 'file to send', null, null)
  .usage(`<cmd> [options]

  Commands:

    post [options]\tpost to a channel
    listen [options]\tlisten on a channel`)
  .arguments('<cmd>')
  .action((cmd) => {
    const {
      host,
      notSecure,
      channel,
      text,
      file
    } = program

    if (!host || !channel) {
      showHelp()
      return false
    }

    if (cmd === 'listen') {
      listen({
        channel,
        host,
        notSecure
      })
    } else if (cmd === 'post') {
      post({
        channel,
        host,
        notSecure,
        text,
        file
      })
    } else {
      showHelp()
    }
  })
  .parse(process.argv)

if (!program.args.length) {
  showHelp()
  return false
}

function showHelp() {
  console.log(art)
  program.help()
}

function listen(props) {
  const url = constructWebsocketUrl(props)
  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'

  ws.on('open', () => {
    console.log(`connected to ${url}\n`)
  })

  ws.on('error', (error) => {
    console.error(error)
  })

  ws.on('message', (data) => {
    if (isArrayBuffer(data)) {
      const {mime, arrayBuffer} = arrayBufferMimeDecouple(data)
      const buffer = Buffer.from(arrayBuffer)

      // TODO
      // check mime type
      var str = buffer.toString('utf8')
      if (str) {
        console.log(`received ${new Date()}:\n`)
        console.log(str)
      }
    }
  })
}

function post(props) {
  const {text, file} = props

  const url = constructWebsocketUrl(props)

  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'

  ws.on('open', () => {
    console.log(`posting data to ${url}:\n\n${text}\n`)
    const mime = 'text/plain'
    const arrayBuffer = str2ab(text)
    const abWithMime = arrayBufferWithMime(arrayBuffer, mime)
    ws.send(abWithMime)
    ws.close()
  })

  ws.on('error', (error) => {
    if (/400|ECONNREFUSED/gi.test(error.message)) {
      console.error('no on is listening on ', path)
    }
  })
}

function constructWebsocketUrl(props) {
  const {host, channel, notSecure} = props
  const scheme = notSecure ? 'ws' : 'wss'

  if (!host || !channel) {
    program.outputHelp()
    return false
  }

  const path = (channel||'').replace(/^\/?/, '/')

  return `${scheme}://${host}${path}`
}

//https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

function isArrayBuffer(data) {
  return /ArrayBuffer/gi.test(Object.prototype.toString.call(data))
}
