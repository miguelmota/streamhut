package client

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"net"
	"net/url"
	"os"
	"time"

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

// StreamConfig ...
type StreamConfig struct {
	Delay   time.Duration
	Timeout time.Duration
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

// Stream ...
func (c *Client) Stream(config *StreamConfig) error {
	url := fmt.Sprintf("%s:%v", c.host, c.port)
	fmt.Printf("streamhut: connecting to %s\n", url)

	conn, err := net.Dial("tcp", url)
	if err != nil {
		return err
	}

	writer := bufio.NewWriter(conn)
	stdinReader := bufio.NewReader(os.Stdin)
	reader := bufio.NewReader(conn)
	ready := false

	receivedData := false
	errChan := make(chan error)
	time.AfterFunc(config.Timeout, func() {
		if !receivedData {
			errChan <- errors.New("timedout")
		}
	})

	go func() {
		for {
			if !ready {
				continue
			}
			line := make([]byte, 1024)
			_, err := stdinReader.Read(line)
			switch err {
			case nil:
				receivedData = true
				writer.Write(line)
			case io.EOF:
				fmt.Println("EOF")
				errChan <- nil
			}
		}
	}()

	go func() {
		for {
			line := make([]byte, 1024)
			_, err := reader.Read(line)
			switch err {
			case nil:
				fmt.Print(string(line))
				if !ready {
					time.Sleep(config.Delay)
					fmt.Println()
				}
				ready = true
			case io.EOF:
				fmt.Println("EOF")
				errChan <- nil
			}
		}
	}()

	return <-errChan
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
