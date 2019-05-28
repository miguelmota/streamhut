package client

import (
	"fmt"
	"net/url"
	"os"

	"github.com/gorilla/websocket"
	"github.com/streamhut/streamhut/common/byteutil"
)

// Client ...
type Client struct {
	host     string
	port     uint
	insecure bool
}

// Config ...
type Config struct {
	Host     string
	Port     uint
	Insecure bool
}

// NewClient ...
func NewClient(config *Config) *Client {
	return &Client{
		host:     config.Host,
		port:     config.Port,
		insecure: config.Insecure,
	}
}

// ListenConfig ...
type ListenConfig struct {
	Channel string
}

// Listen ...
func (c *Client) Listen(config *ListenConfig) error {
	u := constructWsURI(c.host, c.port, config.Channel, c.insecure)
	fmt.Printf("streamhut: connecting to %s\n", u.String())
	wsclient, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}

	defer wsclient.Close()
	fmt.Printf("streamhut: listening on channel %q\n", config.Channel)

	for {
		_, message, err := wsclient.ReadMessage()
		if err != nil {
			return err
		}
		data, mime := byteutil.DecoupleBufferWithMime(message)
		if mime == "shell" {
			os.Stdout.Write(data)
		}
	}
}

func constructWsURI(host string, port uint, channel string, insecure bool) url.URL {
	scheme := "wss"
	if insecure {
		scheme = "ws"
	}

	return url.URL{
		Scheme: scheme,
		Host:   fmt.Sprintf("%s:%d", host, port),
		Path:   fmt.Sprintf("/ws/s/%s", channel),
	}
}

/*
// TODO port from node-streamhut
  .option('-t, --text <text>', 'text to send', null, null)
  .option('-f, --file <filepath>', 'file to send', null, null)

    post [options]\tpost to a channel
    listen [options]\tlisten on a channel

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
*/
