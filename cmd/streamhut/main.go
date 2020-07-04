package main

import (
	"errors"
	"fmt"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	color "github.com/fatih/color"
	lol "github.com/kris-nova/lolgopher"
	log "github.com/sirupsen/logrus"
	cobra "github.com/spf13/cobra"
	"github.com/streamhut/streamhut/pkg/asciiart"
	"github.com/streamhut/streamhut/pkg/client"
	"github.com/streamhut/streamhut/pkg/db"
	"github.com/streamhut/streamhut/pkg/db/sqlite3db"
	"github.com/streamhut/streamhut/pkg/httpserver"
	"github.com/streamhut/streamhut/pkg/tcpserver"
	"github.com/streamhut/streamhut/pkg/util"
	"github.com/streamhut/streamhut/pkg/wsserver"
)

// ErrDBTypeUnsupported ...
var ErrDBTypeUnsupported = errors.New("Database type is unsupported")

// ErrChannelRequired ...
var ErrChannelRequired = errors.New("Channel is required")

var yellow = color.New(color.FgYellow)
var yellowSprintf = color.New(color.FgYellow).SprintFunc()
var redSprintf = color.New(color.FgRed).SprintFunc()
var green = color.New(color.FgGreen)

func main() {
	if os.Getenv("DEBUG") != "" {
		log.SetReportCaller(true)
	}

	defaultHTTPPort := uint(8080)
	defaultTCPPort := uint(1337)
	defaultDelay := 0
	defaultTimeout := 5

	var help bool
	var connectPort uint
	var connectHost string
	var delay int
	var timeout int
	var open bool
	var channel string

	rootCmd := &cobra.Command{
		SilenceErrors: true,
		SilenceUsage:  true,
		Use:           "streamhut",
		Short:         "Streamhut",
		Long: `Streamhut lets you stream and share your terminal.
For more info, visit: https://github.com/streamhut/streamhut`,
		RunE: func(cmd *cobra.Command, args []string) error {
			sclient := client.NewClient(&client.Config{
				Host:     connectHost,
				Port:     connectPort,
				Insecure: true,
			})

			return sclient.Stream(&client.StreamConfig{
				Delay:   time.Duration(delay) * time.Second,
				Timeout: time.Duration(timeout) * time.Second,
				Open:    open,
				Channel: channel,
			})
		},
	}

	rootCmd.PersistentFlags().BoolVarP(&help, "help", "", false, "Show help")
	rootCmd.Flags().UintVarP(&connectPort, "port", "p", defaultTCPPort, "Host port")
	rootCmd.Flags().StringVarP(&connectHost, "host", "h", "127.0.0.1", "Host to connect to")
	rootCmd.Flags().StringVarP(&channel, "channel", "c", "", "Channel to stream to")
	rootCmd.Flags().IntVarP(&delay, "delay", "d", defaultDelay, "Delay in seconds before starting stream")
	rootCmd.Flags().IntVarP(&timeout, "timeout", "t", defaultTimeout, "Max timeout allowed before exiting if no data is recieved after starting")
	rootCmd.Flags().BoolVarP(&open, "open", "o", false, "Open the stream url in your browser")

	var httpPort uint
	var tcpPort uint
	var tls bool
	var tlsCert string
	var tlsKey string
	var dbPath string
	var dbType string
	var shareBaseURL string
	var webTarURL string
	var webDir string
	var humanBandwidthQuotaLimit string
	var humanBandwidthQuotaDuration string
	var randomChannelLength uint

	serverCmd := &cobra.Command{
		Use:   "server",
		Short: "Start server",
		Long:  "Start the streamhut server",
		Args: func(cmd *cobra.Command, args []string) error {
			if dbType != "sqlite3" {
				return ErrDBTypeUnsupported
			}

			return nil
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			var db db.DB
			if dbType == "sqlite3" {
				db = sqlite3db.NewDB(&sqlite3db.Config{
					DBPath: dbPath,
				})
			}

			ws := wsserver.NewWS(&wsserver.Config{
				DB: db,
			})

			if shareBaseURL == "" {
				protocol := "http"
				if tls {
					protocol = "https"
				}

				if httpPort == 443 || httpPort == 80 {
					shareBaseURL = fmt.Sprintf("%s://localhost/", protocol)
				} else {
					shareBaseURL = fmt.Sprintf("%s://localhost:%d/", protocol, httpPort)
				}
			}

			bandwidthQuotaLimit := util.StorageSizeToUint64(humanBandwidthQuotaLimit)
			bandwidthQuotaDuration := util.DurationStringToType(humanBandwidthQuotaDuration)

			tcpServer := tcpserver.NewServer(&tcpserver.Config{
				WS:                     ws,
				Port:                   tcpPort,
				DB:                     db,
				ShareBaseURL:           shareBaseURL,
				BandwidthQuotaLimit:    bandwidthQuotaLimit,
				BandwidthQuotaDuration: bandwidthQuotaDuration,
				RandomChannelLength:    randomChannelLength,
			})

			errCh := make(chan error, 2)
			go func() {
				err := tcpServer.Start()
				if err != nil {
					errCh <- err
				}
			}()

			server := httpserver.NewServer(&httpserver.Config{
				Port:      httpPort,
				WS:        ws,
				WebTarURL: webTarURL,
				WebDir:    webDir,
				TLS:       tls,
				TLSCert:   tlsCert,
				TLSKey:    tlsKey,
			})

			handleExit(func() {
				db.Close()
			})

			lolwriter := lol.NewTruecolorLolWriter()
			lolwriter.Write([]byte(asciiart.Hut()))
			fmt.Println("\nStarting server...")
			green.Printf("HTTP/WebSocket port (web): %d\n", server.Port())
			green.Printf("TCP port (streaming): %d\n", tcpServer.Port())

			if tcpServer.BandwidthQuotaEnabled() {
				yellow.Printf("Bandwidth quota limit: %s\n", tcpServer.BandwidthQuotaLimit().String())
				yellow.Printf("Bandwidth quota duration: %s\n", tcpServer.BandwidthQuotaDuration().String())
			}

			err := server.Start()
			if err != nil {
				errCh <- err
			}

			select {
			case err := <-errCh:
				return err
			default:
				return nil
			}
		},
	}

	if os.Getenv("PORT") != "" {
		i, err := strconv.ParseUint(os.Getenv("PORT"), 10, 32)
		if err != nil {
			log.Fatal(err)
		}

		defaultHTTPPort = uint(i)
	}

	if os.Getenv("NET_PORT") != "" {
		i, err := strconv.ParseUint(os.Getenv("NET_PORT"), 10, 32)
		if err != nil {
			log.Fatal(err)
		}

		defaultTCPPort = uint(i)

		log.Warn("Deprecation notice: NET_PORT is deprecated. Please use TCP_PORT instead.")
	}

	if os.Getenv("TCP_PORT") != "" {
		i, err := strconv.ParseUint(os.Getenv("TCP_PORT"), 10, 32)
		if err != nil {
			log.Fatal(err)
		}

		defaultTCPPort = uint(i)
	}

	defaultShareBaseURL := os.Getenv("HOST_URL")
	if defaultShareBaseURL == "" {
		defaultShareBaseURL = os.Getenv("SHARE_BASE_URL")
	}

	serverCmd.Flags().UintVarP(&httpPort, "port", "p", defaultHTTPPort, "HTTP Port")
	serverCmd.Flags().UintVarP(&tcpPort, "tcp-port", "t", defaultTCPPort, "TCP Port")
	serverCmd.Flags().BoolVarP(&tls, "tls", "", false, "Enable TLS. Requires TLS cert and TLS key parameters.")
	serverCmd.Flags().StringVarP(&tlsCert, "tls-cert", "", "", "TLS certificate file path")
	serverCmd.Flags().StringVarP(&tlsKey, "tls-key", "", "", "TLS key file path")
	serverCmd.Flags().StringVarP(&dbPath, "db-path", "", sqlite3db.DefaultDBPath, "Sqlite3 database path")
	serverCmd.Flags().StringVarP(&dbType, "db-type", "", "sqlite3", "Database type: Options are \"sqlite\"")
	serverCmd.Flags().StringVarP(&shareBaseURL, "share-base-url", "", defaultShareBaseURL, "Share base URL. Example: \"https://stream.ht/\"")
	serverCmd.Flags().StringVarP(&webTarURL, "web-tar-url", "", httpserver.DefaultWebTarURL, "Web app tarball url to download")
	serverCmd.Flags().StringVarP(&webDir, "web-dir", "", httpserver.DefaultWebDir, "Web app directory")
	serverCmd.Flags().StringVarP(&humanBandwidthQuotaLimit, "bandwidth-quota-limit", "", os.Getenv("BANDWIDTH_QUOTA_LIMIT"), "Bandwidth quota limit (eg. 100kb, 1mb, 1gb, etc)")
	serverCmd.Flags().StringVarP(&humanBandwidthQuotaDuration, "bandwidth-quota-duration", "", os.Getenv("BANDWIDTH_QUOTA_DURATION"), "Bandwidth quota duration (eg. 45s, 10m, 1h, 1d, 1w, etc)")
	serverCmd.Flags().UintVarP(&randomChannelLength, "random-channel-length", "", 6, "Number of characters to use for random channel generation.")

	var host string
	var port uint
	var listenChannel string
	var insecure bool

	listenCmd := &cobra.Command{
		Use:   "listen",
		Short: "Listen on a channel",
		Long:  "Listen on a channel and receive messages",
		Args: func(cmd *cobra.Command, args []string) error {
			if listenChannel == "" {
				return ErrChannelRequired
			}

			return nil
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			sclient := client.NewClient(&client.Config{
				Host:     host,
				Port:     port,
				Insecure: insecure,
			})

			return sclient.Listen(&client.ListenConfig{
				Channel: listenChannel,
			})
		},
	}

	listenCmd.Flags().StringVarP(&listenChannel, "channel", "c", "", "Channel to listen on")
	listenCmd.Flags().StringVarP(&host, "host", "h", "127.0.0.1", "Host to run listener on")
	listenCmd.Flags().UintVarP(&port, "port", "p", 8080, "Host port listening on")
	listenCmd.Flags().BoolVarP(&insecure, "insecure", "i", false, "Set if remote host is insecure (not using HTTPS)")

	rootCmd.AddCommand(serverCmd, listenCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(redSprintf(err))
		os.Exit(1)
	}
}

func handleExit(cb func()) {
	var gracefulStop = make(chan os.Signal)
	signal.Notify(gracefulStop, syscall.SIGTERM)
	signal.Notify(gracefulStop, syscall.SIGINT)
	go func() {
		sig := <-gracefulStop
		fmt.Printf("Caught signal: %+v\n%s", sig, yellowSprintf("Shutting down..."))
		cb()
		os.Exit(0)
	}()
}
