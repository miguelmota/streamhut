package tcpserver

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"net"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	uuid "github.com/satori/go.uuid"
	"github.com/streamhut/streamhut/common/byteutil"
	"github.com/streamhut/streamhut/common/stringutil"
	"github.com/streamhut/streamhut/common/util"
	"github.com/streamhut/streamhut/pkg/db"
	"github.com/streamhut/streamhut/pkg/wsserver"
	"github.com/streamhut/streamhut/types"
)

// Server ...
type Server struct {
	host     string
	listener net.Listener
	port     uint
	ws       *wsserver.WS
	db       db.DB
}

// Config ...
type Config struct {
	Host string
	Port uint
	WS   *wsserver.WS
	DB   db.DB
}

// NewServer ...
func NewServer(config *Config) *Server {
	return &Server{
		host: config.Host,
		port: config.Port,
		ws:   config.WS,
		db:   config.DB,
	}
}

// Start ...
func (s *Server) Start() {
	listener, err := net.Listen("tcp", fmt.Sprintf("%s:%d", s.host, s.port))
	if err != nil {
		log.Fatal(err)
	}
	defer listener.Close()
	s.listener = listener

	fmt.Printf("TCP port: %d\n", s.port)
	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Fatal(err)
		}

		id := uuid.Must(uuid.NewV4(), nil)

		client := &wsserver.Conn{
			Channel: "",
			Netconn: conn,
			ID:      id.String(),
		}
		go s.handleRequest(client)
	}
}

func (s *Server) randChannel() string {
	for {
		channel := stringutil.RandStringRunes(6)
		_, ok := s.ws.Socks[channel]
		if !ok && util.ValidChannelName(channel) {
			return channel
		}
	}
}

func (s *Server) channelTaken(channel string) bool {
	_, ok := s.ws.Socks[channel]
	return ok
}

func (s *Server) handleRequest(client *wsserver.Conn) {
	reader := bufio.NewReader(client.Netconn)
	index := 0
	expired := false

	time.AfterFunc(5*time.Millisecond, func() {
		expired = true
		if client.Channel == "" {
			client.Channel = s.randChannel()
		}
		//s.ws.netConnections[client.channel] = append(s.ws.Socks[client.channel], client)
		str := fmt.Sprintf("streamhut: streaming to %s\n", s.shareURL(client))
		client.Netconn.Write([]byte(str))
	})

	for {
		line := make([]byte, 1024)
		_, err := reader.Read(line)
		switch err {
		case nil:
			// echo back to client
			client.Netconn.Write(line)
		case io.EOF:
			return
		default:
			os.Exit(0)
		}

		if index == 0 && !expired {
			if len(line) > 0 && line[0] == '#' {
				re := regexp.MustCompile(`#([a-zA-Z0-9]+)\n?\r?`)
				matches := re.FindAllStringSubmatch(string(line), -1)
				if len(matches) > 0 && len(matches[0]) > 1 {
					client.Channel = util.NormalizeChannelName(matches[0][1])
					if !util.ValidChannelName(client.Channel) {
						msg := fmt.Sprintf("streamhut: channel name %q is not available", client.Channel)
						client.Netconn.Write([]byte(msg))
						if err := client.Netconn.Close(); err != nil {
							log.Fatal(err)
						}
						continue
					}
					index++
					continue
				}
			}
		}

		if client.Channel == "" {
			continue
		}

		mime := "shell"
		bufferWithMime := byteutil.BufferWithMime(line, mime)

		go s.db.InsertStreamLog(&types.StreamLog{
			Channel: client.Channel,
			Data:    line,
		})

		clients, ok := s.ws.Socks[client.Channel]
		if ok {
			for _, cl := range clients {
				fmt.Sprintf("streaming to %s on channel %q", cl.ID, cl.Channel)
				if cl.Netconn != nil {
					if _, err := cl.Netconn.Write(bufferWithMime); err != nil {
						log.Fatal(err)
					}
				}
				if cl.Wsconn != nil {
					if err = cl.Wsconn.WriteMessage(websocket.BinaryMessage, bufferWithMime); err != nil {
						log.Fatal(err)
					}
				}
			}
		}
	}
}

func (s *Server) shareURL(client *wsserver.Conn) string {
	host := s.host
	if host == "" {
		host = "127.0.0.1"
	}

	hostURL := os.Getenv("HOST_URL")
	if hostURL == "" {
		hostURL = fmt.Sprintf("http://%s:%d", host, s.port)
	}

	u, err := url.Parse(hostURL)
	if err != nil {
		log.Fatal(err)
	}

	host = u.Host
	protocol := u.Scheme
	pathname := fmt.Sprintf("s/%s", client.Channel)
	if host == "stream.ht" {
		pathname = client.Channel
	}

	if !strings.HasSuffix(u.Path, "/") {
		pathname = "/" + pathname
	}

	pathname = u.Path + pathname
	return fmt.Sprintf("%s//%s%s", protocol, host, pathname)
}
