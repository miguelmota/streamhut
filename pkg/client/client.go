package client

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"net"
	"net/url"
	"os"
	"regexp"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/streamhut/streamhut/common/byteutil"
	"github.com/streamhut/streamhut/common/open"
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
	Open    bool
}

// ErrConnectionRefused ...
var ErrConnectionRefused = errors.New("ECONNREFUSED")

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
	serverURL := fmt.Sprintf("%s:%v", c.host, c.port)

	conn, err := net.Dial("tcp", serverURL)
	if err != nil {
		if checkErr(err) != ErrConnectionRefused {
			return err
		}

		// if no local server running, then use canonical server
		conn, err = net.Dial("tcp", "stream.ht:1337")
		if err != nil {
			return err
		}
	}

	fmt.Printf("streamhut: connecting to %s\n", serverURL)

	timeout := config.Timeout
	delay := config.Delay
	openURL := config.Open

	if delay >= timeout {
		timeout = delay + (5 * time.Second)
	}

	writer := bufio.NewWriter(conn)
	stdinReader := bufio.NewReader(os.Stdin)
	reader := bufio.NewReader(conn)
	ready := false

	receivedData := false
	errChan := make(chan error)
	time.AfterFunc(timeout, func() {
		if !receivedData {
			errChan <- errors.New("timedout")
		}
	})

	go func() {
		// send to streamhut server
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
		// handle responses from streamhut
		for {
			line := make([]byte, 1024)
			_, err := reader.Read(line)
			switch err {
			case nil:
				lineStr := string(line)
				if strings.Contains(lineStr, "streaming to") {
					regex := regexp.MustCompile(`(https?.*)`)
					matches := regex.FindAllString(lineStr, -1)
					if len(matches) > 0 {
						streamURL := matches[0]
						if openURL {
							open.URL(streamURL)
						}
					}
				}

				fmt.Print(lineStr)
				if !ready {
					time.Sleep(delay)
					fmt.Println()
				}
				if !ready {
					ready = true
				}
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

func checkErr(err error) error {
	if err == nil {
		return nil
	}

	if oerr, ok := err.(*net.OpError); ok {
		if scerr, ok := oerr.Err.(*os.SyscallError); ok {
			if scerr.Err == syscall.ECONNREFUSED {
				return ErrConnectionRefused
			}
		}
	}

	return err
}
