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

	"github.com/patrickmn/go-cache"
	gocache "github.com/patrickmn/go-cache"
	uuid "github.com/satori/go.uuid"
	"github.com/streamhut/streamhut/common/byteutil"
	"github.com/streamhut/streamhut/common/stringutil"
	common "github.com/streamhut/streamhut/common/util"
	"github.com/streamhut/streamhut/pkg/db"
	"github.com/streamhut/streamhut/pkg/util"
	"github.com/streamhut/streamhut/pkg/wsserver"
	"github.com/streamhut/streamhut/types"
)

// ErrInvalidQuotaLimit ...
var ErrInvalidQuotaLimit = fmt.Sprintf("Invalid quota size")

// ErrInvalidQuotaDuration ...
var ErrInvalidQuotaDuration = fmt.Sprintf("Invalid quota duration")

// DefaultBandwidthQuotaLimit ...
var DefaultBandwidthQuotaLimit = 1000 * 1000 * 10 // 10mb

// DefaultBandwidthQuotaDuration ...
var DefaultBandwidthQuotaDuration = 1 * time.Minute

// BandwidthQuotaLimit type
type BandwidthQuotaLimit uint64

// Server ...
type Server struct {
	host                   string
	listener               net.Listener
	port                   uint
	ws                     *wsserver.WS
	db                     db.DB
	shareBaseURL           string
	cache                  *gocache.Cache
	bandwidthQuotaLimit    BandwidthQuotaLimit
	bandwidthQuotaDuration time.Duration
}

// Config ...
type Config struct {
	Host                   string
	Port                   uint
	WS                     *wsserver.WS
	DB                     db.DB
	ShareBaseURL           string
	BandwidthQuotaLimit    uint64
	BandwidthQuotaDuration time.Duration
}

// NewServer ...
func NewServer(config *Config) *Server {
	shareBaseURL := config.ShareBaseURL
	if shareBaseURL != "" {
		if !strings.HasSuffix(shareBaseURL, "/") {
			shareBaseURL += "/"
		}
	}

	if config.BandwidthQuotaLimit > 0 && config.BandwidthQuotaDuration == 0 {
		log.Fatal(ErrInvalidQuotaDuration)
	}

	if config.BandwidthQuotaDuration > 0 && config.BandwidthQuotaLimit == 0 {
		log.Fatal(ErrInvalidQuotaLimit)
	}

	return &Server{
		host:                   config.Host,
		port:                   config.Port,
		ws:                     config.WS,
		db:                     config.DB,
		shareBaseURL:           shareBaseURL,
		cache:                  cache.New(gocache.DefaultExpiration, gocache.DefaultExpiration),
		bandwidthQuotaLimit:    BandwidthQuotaLimit(config.BandwidthQuotaLimit),
		bandwidthQuotaDuration: config.BandwidthQuotaDuration,
	}
}

// Start ...
func (s *Server) Start() error {
	listener, err := net.Listen("tcp", fmt.Sprintf("%s:%d", s.host, s.port))
	if err != nil {
		return err
	}

	defer listener.Close()
	s.listener = listener

	for {
		conn, err := listener.Accept()
		if err != nil {
			return err
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
		if !ok && common.ValidChannelName(channel) {
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
	channelReadExpired := false

	var ip string
	if addr, ok := client.Netconn.RemoteAddr().(*net.TCPAddr); ok {
		ip = addr.IP.String()
	}

	// NOTE: a timeout to allow reading of channel first
	time.AfterFunc(5*time.Millisecond, func() {
		channelReadExpired = true
		if client.Channel == "" {
			client.Channel = s.randChannel()
		}
		//s.ws.netConnections[client.channel] = append(s.ws.Socks[client.channel], client)
		str := fmt.Sprintf("streamhut: streaming to %s\n", s.shareURL(client))
		client.Netconn.Write([]byte(str))
	})

	for {
		line := make([]byte, 1024)
		n, err := reader.Read(line)
		switch err {
		case nil:
			if s.bandwidthQuotaLimit > 0 {
				_, exp, found := s.cache.GetWithExpiration(ip)
				if found {
					expiresIn := time.Duration(exp.Unix()-time.Now().Unix()) * time.Second

					if expiresIn.Seconds() == 0 {
						client.ResetBandwidthQuota()
						s.cache.Delete(ip)
					} else {
						msg := fmt.Sprintf("streamhut: bandwidth quota reached. Try again in %vs", expiresIn.Seconds())
						log.Printf("quota reached for ip %v; can retry in %vs\n", ip, expiresIn.Seconds())
						client.Netconn.Write([]byte(msg))

						// NOTE: timeout must be less than channelReadExpired
						time.Sleep(4 * time.Millisecond)
						client.Netconn.Close()
						return
					}
				}

				client.TollBandwidth(uint64(n))
				if client.BandwidthQuotaUsed() > s.bandwidthQuotaLimit.Uint64() {
					expiresIn := time.Duration(int(s.bandwidthQuotaDuration.Seconds())-time.Now().Second()) * time.Second
					s.cache.Set(ip, time.Now(), expiresIn)
					msg := fmt.Sprintf("\nstreamhut: bandwidth quota reached. Try again in %vs", expiresIn.Seconds())
					log.Printf("quota reached for ip %v; can retry in %vs\n", ip, expiresIn.Seconds())
					client.Netconn.Write([]byte(msg))
					time.Sleep(1 * time.Second)
					client.Netconn.Close()
					return
				}
			}

			// echo back to client
			client.Netconn.Write(line)
		case io.EOF:
			return
		default:
			os.Exit(0)
		}

		if index == 0 && !channelReadExpired {
			if len(line) > 0 && line[0] == '#' {
				re := regexp.MustCompile(`#([a-zA-Z0-9]+)\n?\r?`)
				matches := re.FindAllStringSubmatch(string(line), -1)
				if len(matches) > 0 && len(matches[0]) > 1 {
					client.Channel = common.NormalizeChannelName(matches[0][1])
					if !common.ValidChannelName(client.Channel) {
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
					if err = cl.Write(bufferWithMime); err != nil {
						log.Fatal(err)
					}
				}
			}
		}
	}
}

func (s *Server) shareURL(client *wsserver.Conn) string {
	if s.shareBaseURL != "" {
		return fmt.Sprintf("%s%s", s.shareBaseURL, client.Channel)
	}

	host := s.host
	if host == "" {
		host = "127.0.0.1"
	}

	hostURL := fmt.Sprintf("http://%s:%d", host, s.port)
	u, err := url.Parse(hostURL)
	if err != nil {
		log.Fatal(err)
	}

	host = u.Host
	protocol := u.Scheme
	pathname := fmt.Sprintf("s/%s", client.Channel)
	if !strings.HasSuffix(u.Path, "/") {
		pathname = "/" + pathname
	}

	pathname = u.Path + pathname
	return fmt.Sprintf("%s//%s%s", protocol, host, pathname)
}

// Port ...
func (s *Server) Port() uint {
	return s.port
}

// BandwidthQuotaLimit ...
func (s *Server) BandwidthQuotaLimit() BandwidthQuotaLimit {
	return s.bandwidthQuotaLimit
}

// BandwidthQuotaDuration ...
func (s *Server) BandwidthQuotaDuration() time.Duration {
	return s.bandwidthQuotaDuration
}

// BandwidthQuotaEnabled ...
func (s *Server) BandwidthQuotaEnabled() bool {
	return s.bandwidthQuotaLimit > 0
}

// Uint64 ...
func (b BandwidthQuotaLimit) Uint64() uint64 {
	return uint64(b)
}

// String ...
func (b BandwidthQuotaLimit) String() string {
	return util.Uint64ToStorageSizeString(uint64(b))
}
