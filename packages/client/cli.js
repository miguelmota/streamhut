const fs = require('fs')
const path = require('path')
const program = require('commander')
const WebSocket = require('ws')
const {
  arrayBufferWithMime,
  arrayBufferMimeDecouple
} = require('arraybuffer-mime')

const { start } = require('streamhut-server')
const packageJson = require('./package.json')

const hut = fs.readFileSync(path.resolve(__dirname, 'hut.txt'), 'utf8')

if (process.argv.indexOf('--help') > -1 &&
  process.argv.length === 3) {
  console.log(hut)
}

program
  .version(packageJson.version)
  .option('-h, --host <host>', 'host name', null, null)
  .option('-p, --port <port>', 'host port', null, null)
  .option('-n, --not-secure', 'not using SSL', null, false)
  .option('-c, --channel <id>', 'channel ID', null, null)
  .option('-t, --text <text>', 'text to send', null, null)
  .option('-f, --file <filepath>', 'file to send', null, null)
  .usage(`<cmd> [options]

  Commands:

    post [options]\tpost to a channel
    listen [options]\tlisten on a channel
    server [options]\tstart a streamhut server`)
  .arguments('<cmd>')
  .action((cmd) => {
    const {
      host,
      port,
      notSecure,
      channel,
      text,
      file
    } = program

    if (cmd === 'server') {
      start({
        port
      })
    } else if (cmd === 'listen') {
      if (!host || !channel) {
        return showHelp()
      }

      listen({
        channel,
        host,
        port,
        notSecure
      })
    } else if (cmd === 'post') {
      if (!host || !channel) {
        return showHelp()
      }

      if (text || file) {
        post({
          channel,
          host,
          port,
          notSecure,
          text,
          filepath: file
        })
      } else {
        process.stdin.on('readable', () => {
          const rawData = process.stdin.read()

          if (rawData) {
            const data = rawData.toString('utf8')
            post({
              channel,
              host,
              port,
              notSecure,
              text: data
            })
          }
        })
      }
    } else {
      showHelp()
    }
  })
  .parse(process.argv)

if (!program.args.length) {
  showHelp()
  process.exit(0)
}

function showHelp () {
  console.log(hut)
  program.help()
}

function startServer (props) {
  const port = props.port

  server.start(port)
}

function listen (props) {
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

function post (props) {
  const {text, filepath, channel} = props

  const url = constructWebsocketUrl(props)
  console.log(`sending to ${url}`)

  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'

  const send = (arrayBuffer) => {
    ws.send(arrayBuffer)
  }

  ws.on('open', () => {
    if (text) {
      console.log(`posting data to ${url}:\n\n${text}\n`)
      const mime = 'text/plain'
      const arrayBuffer = str2ab(text)
      const abWithMime = arrayBufferWithMime(arrayBuffer, mime)
      send(abWithMime)
    }

    if (filepath) {
      console.log(`posting file data to ${url}:\n\n${filepath}\n`)
      const data = fs.readFileSync(filepath, 'utf8')

      const mime = 'text/plain'
      const arrayBuffer = str2ab(data)
      const abWithMime = arrayBufferWithMime(arrayBuffer, mime)
      send(abWithMime)
    }

    ws.close()
  })

  ws.on('error', (error) => {
    if (/400|ECONNREFUSED/gi.test(error.message)) {
      console.error(`no one is listening on channel: ${channel}`)
    }
  })
}

function constructWebsocketUrl (props) {
  const {host, port, channel, notSecure} = props
  const scheme = notSecure ? 'ws' : 'wss'

  if (!host || !channel) {
    program.outputHelp()
    return false
  }

  const path = (channel || '').replace(/^\/?/, '/')

  return `${scheme}://${host}${port ? `:${port}` : ''}${path}`
}

// https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
function str2ab (str) {
  var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

function isArrayBuffer (data) {
  return /ArrayBuffer/gi.test(Object.prototype.toString.call(data))
}
