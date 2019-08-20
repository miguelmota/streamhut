package main

import (
	"errors"
	"fmt"
	"os"
	"os/signal"
	"syscall"

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
var green = color.New(color.FgGreen)

func main() {
	if os.Getenv("DEBUG") != "" {
		log.SetReportCaller(true)
	}

	var help bool

	rootCmd := &cobra.Command{
		Use:   "streamhut",
		Short: "Streamhut",
		Long: `Streamhut lets you stream and share your terminal.
For more info, visit: https://github.com/streamhut/streamhut`,
		Run: func(cmd *cobra.Command, args []string) {
			cmd.Help()
		},
	}

	rootCmd.PersistentFlags().BoolVarP(&help, "help", "", false, "Show help")

	var httpPort uint
	var tcpPort uint
	var dbPath string
	var dbType string
	var shareBaseURL string
	var webTarURL string
	var webDir string
	var humanBandwidthQuotaLimit string
	var humanBandwidthQuotaDuration string

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
				shareBaseURL = fmt.Sprintf("http://127.0.0.1:%d/", httpPort)
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
			})

			go func() {
				log.Fatal(tcpServer.Start())
			}()

			server := httpserver.NewServer(&httpserver.Config{
				Port:      httpPort,
				WS:        ws,
				WebTarURL: webTarURL,
				WebDir:    webDir,
			})

			handleExit(func() {
				db.Close()
			})

			lolwriter := lol.NewTruecolorLolWriter()
			lolwriter.Write([]byte(asciiart.Hut()))
			fmt.Println("\nStarting server...")
			green.Printf("HTTP/WebSocket port: %d\n", server.Port())
			green.Printf("TCP port: %d\n", tcpServer.Port())

			if tcpServer.BandwidthQuotaEnabled() {
				yellow.Printf("Bandwidth quota limit: %s\n", tcpServer.BandwidthQuotaLimit().String())
				yellow.Printf("Bandwidth quota duration: %s\n", tcpServer.BandwidthQuotaDuration().String())
			}

			return server.Start()
		},
	}

	serverCmd.Flags().UintVarP(&httpPort, "port", "p", 8080, "HTTP Port")
	serverCmd.Flags().UintVarP(&tcpPort, "tcp-port", "t", 1337, "TCP Port")
	serverCmd.Flags().StringVarP(&dbPath, "db-path", "", sqlite3db.DefaultDBPath, "Sqlite3 database path")
	serverCmd.Flags().StringVarP(&dbType, "db-type", "", "sqlite3", "Database type: Options are \"sqlite\"")
	serverCmd.Flags().StringVarP(&shareBaseURL, "share-base-url", "", os.Getenv("HOST_URL"), "Share base URL. Example: \"https://stream.ht/\"")
	serverCmd.Flags().StringVarP(&webTarURL, "web-tar-url", "", httpserver.DefaultWebTarURL, "Web app tarball url to download")
	serverCmd.Flags().StringVarP(&webDir, "web-dir", "", httpserver.DefaultWebDir, "Web app directory")
	serverCmd.Flags().StringVarP(&humanBandwidthQuotaLimit, "bandwidth-quota-limit", "", os.Getenv("BANDWIDTH_QUOTA_LIMIT"), "bandwidth quota limit (eg. 100kb, 1mb, 1gb, etc)")
	serverCmd.Flags().StringVarP(&humanBandwidthQuotaDuration, "bandwidth-quota-duration", "", os.Getenv("BANDWIDTH_QUOTA_DURATION"), "bandwidth quota duration (eg. 45s, 10m, 1h, 1d, 1w, etc)")

	var host string
	var port uint
	var insecure bool
	var channel string

	listenCmd := &cobra.Command{
		Use:   "listen",
		Short: "Listen on a channel",
		Long:  "Listen on a channel and receive messages",
		Args: func(cmd *cobra.Command, args []string) error {
			if channel == "" {
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
				Channel: channel,
			})
		},
	}

	listenCmd.Flags().StringVarP(&channel, "channel", "c", "", "Channel to listen on")
	listenCmd.Flags().StringVarP(&host, "host", "h", "127.0.0.1", "Host to run listener on")
	listenCmd.Flags().UintVarP(&port, "port", "p", 1337, "Host port listening on")
	listenCmd.Flags().BoolVarP(&insecure, "insecure", "i", false, "Set if remote host is insecure (not using HTTPS)")

	rootCmd.AddCommand(serverCmd, listenCmd)

	if err := rootCmd.Execute(); err != nil {
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
