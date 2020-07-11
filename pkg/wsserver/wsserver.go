package wsserver

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"regexp"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	uuid "github.com/satori/go.uuid"
	"github.com/streamhut/streamhut/pkg/byteutil"
	"github.com/streamhut/streamhut/pkg/db"
	"github.com/streamhut/streamhut/types"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Conn ...
type Conn struct {
	ID             string
	Channel        string
	Wsconn         *websocket.Conn
	Netconn        net.Conn
	BandwidthQuota uint64
	mu             sync.Mutex
}

// Config ...
type Config struct {
	DB db.DB
}

// WS ...
type WS struct {
	db    db.DB
	Socks map[string][]*Conn
}

// NewWS ...
func NewWS(config *Config) *WS {
	return &WS{
		db:    config.DB,
		Socks: make(map[string][]*Conn),
	}
}

// Handler ...
func (w *WS) Handler(wr http.ResponseWriter, r *http.Request) {
	re, err := regexp.Compile(".*/s/([a-z]+)/?.*")
	if err != nil {
		fmt.Println("error:", err)
		return
	}

	matches := re.FindStringSubmatch(r.URL.String())
	if len(matches) <= 1 {
		return
	}

	pathname := matches[1]

	fmt.Println("connected:", pathname)

	conn, err := upgrader.Upgrade(wr, r, nil)
	if err != nil {
		fmt.Println("error:", err)
		return
	}

	cn := &Conn{
		Channel: pathname,
		Wsconn:  conn,
	}
	w.Socks[pathname] = w.createSock(cn, pathname, w.Socks[pathname])

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			w.handleDisconnect(cn, pathname)
			return
		}

		fmt.Println("received data")

		buffer, mime := byteutil.DecoupleBufferWithMime(msg)
		go w.db.InsertStreamMessage(&types.StreamMessage{
			Channel: cn.Channel,
			Message: buffer,
			Mime:    mime,
		})

		for _, client := range w.Socks[pathname] {
			fmt.Printf("Streaming to %s %s\n", client.ID, pathname)
			if err = client.Write(msg); err != nil {
				fmt.Println(err)
				return
			}
		}

	}
}

// Write ...
func (conn *Conn) Write(msg []byte) error {
	conn.mu.Lock()
	defer conn.mu.Unlock()
	return conn.Wsconn.WriteMessage(websocket.BinaryMessage, msg)
}

// TollBandwidth ...
func (conn *Conn) TollBandwidth(n uint64) {
	conn.BandwidthQuota = conn.BandwidthQuota + n
}

// ResetBandwidthQuota ...
func (conn *Conn) ResetBandwidthQuota() {
	conn.BandwidthQuota = 0
}

// BandwidthQuotaUsed ...
func (conn *Conn) BandwidthQuotaUsed() uint64 {
	return conn.BandwidthQuota
}

func (w *WS) handleDisconnect(conn *Conn, channel string) {
	fmt.Printf("close %s\n", conn.ID)

	clients := w.Socks[channel]

	index := -1
	for i, client := range clients {
		if conn.ID == client.ID {
			index = i
		}
	}

	if index > -1 {
		clients = append(clients[:index], clients[index+1:]...)
	}

	w.Socks[channel] = clients

	if err := w.sendConnections(clients); err != nil {
		fmt.Println("error:", err)
	}
}

func (w *WS) createSock(conn *Conn, pathname string, clients []*Conn) []*Conn {
	var err error
	id := uuid.Must(uuid.NewV4(), err)
	conn.ID = id.String()

	clients = append(clients, conn)

	fmt.Printf("connected %s %s\n", conn.ID, pathname)

	if err := w.sendConnections(clients); err != nil {
		fmt.Println(err)
		return clients
	}

	return clients
}

// ServerMessage ...
type ServerMessage struct {
	Root *ServerMessageData `json:"__server_message__"`
}

// ServerMessageData ...
type ServerMessageData struct {
	Data *ServerMessageConnections `json:"data"`
}

// ServerMessageConnections ...
type ServerMessageConnections struct {
	ConnectionID string   `json:"connectionId"`
	Connections  []string `json:"connections"`
}

func (w *WS) sendConnections(clients []*Conn) error {
	errCh := make(chan error, 2)
	for _, client := range clients {
		connections := []string{}
		for _, connection := range clients {
			if connection.ID != client.ID {
				connections = append(connections, connection.ID)
			}
		}

		sm := &ServerMessage{
			Root: &ServerMessageData{
				Data: &ServerMessageConnections{
					ConnectionID: client.ID,
					Connections:  connections,
				},
			},
		}

		msg, err := json.Marshal(sm)
		if err != nil {
			return err
		}

		if err := client.Write(msg); err != nil {
			return err
		}

		go func() {
			// TODO: read from ws settings
			play := false
			logs := w.db.ReadStreamLogs(client.Channel)
			for i, vLog := range logs {
				mime := "shell"
				if play {
					var date1 int64
					if i > 0 {
						date1 = logs[i-1].CreatedAt.Unix()
					}

					date2 := logs[i].CreatedAt.Unix()
					if i == 0 {
						date1 = date2
					}

					elapsed := date2 - date1
					time.Sleep(time.Duration(elapsed) * time.Second)
					/*

					   let date1 = null
					   if (i > 0) {
					     date1 = toUnix(logs[i-1].created_at)
					   }
					   let date2 = toUnix(logs[i].created_at)
					   if (i == 0) {
					     date1 = date2
					   }
					   let elapsed = date2 - date1
					   await sleep(elapsed*1e3)
					*/
				}

				if mime != "shell-stdin" {
					bufferWithMime := byteutil.BufferWithMime(vLog.Data, mime)
					if err = client.Write(bufferWithMime); err != nil {
						errCh <- err
						return
					}
				}
			}
		}()

		go func(client *Conn) {
			messages := w.db.ReadStreamMessages(client.Channel)
			for _, vLog := range messages {
				if vLog.Mime != "shell-stdin" {
					bufferWithMime := byteutil.BufferWithMime(vLog.Message, vLog.Mime)
					if err = client.Write(bufferWithMime); err != nil {
						errCh <- err
						return
					}
				}
			}
		}(client)

	}

	select {
	case err := <-errCh:
		return err
	default:
		return nil
	}
}
