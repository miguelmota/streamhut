package cli

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/fatih/color"
	lol "github.com/kris-nova/lolgopher"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/streamhut/streamhut/pkg/asciiart"
	"github.com/streamhut/streamhut/pkg/client"
	"github.com/streamhut/streamhut/pkg/db"
	"github.com/streamhut/streamhut/pkg/db/sqlite3db"
	"github.com/streamhut/streamhut/pkg/httpserver"
	"github.com/streamhut/streamhut/pkg/tcpserver"
	"github.com/streamhut/streamhut/pkg/term"
	"github.com/streamhut/streamhut/pkg/util"
	"github.com/streamhut/streamhut/pkg/version"
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

var defaultHost = "127.0.0.1"
var defaultHTTPPort = uint(8080)
var defaultTCPPort = uint(1337)
var defaultDelay = 0
var defaultTimeout = 5
var defaultCommand = ""

func rootCommand() *cobra.Command {
	var help bool
	var connectPort uint
	var connectHost string
	var delay int
	var timeout int
	var open bool
	var channel string
	var command string
	var writable bool
	var insecure bool
	var width int
	var height int

	rootCmd := &cobra.Command{
		SilenceErrors: true,
		SilenceUsage:  true,
		Use:           "streamhut",
		Version:       version.Version,
		Short:         "Streamhut",
		Long: `Streamhut lets you stream and share your terminal.
For more info, visit: https://github.com/streamhut/streamhut`,
		Args: cobra.ArbitraryArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			if command == "" || command == defaultCommand {
				if len(args) > 0 {
					command = args[0]
				}
			}

			if channel == "" {
				// TODO: let server decide channel name
				channel = util.RandomChannelName(6)
			}

			if command != "" {
				outStream := new(bytes.Buffer)
				streamInputReader, termOutputWriter := io.Pipe()

				sclient := client.NewClient(&client.Config{
					Host:     connectHost,
					Port:     connectPort,
					Insecure: insecure,
				})

				go func() {
					err := sclient.Stream(&client.StreamConfig{
						Delay:   time.Duration(delay) * time.Second,
						Timeout: time.Duration(timeout) * time.Second,
						Open:    open,
						Channel: channel,
						Stdin:   streamInputReader,
						Echo:    false,
					})

					if err != nil {
						log.Fatal(err)
					}
				}()

				inputToTermReader, incomingStreamWriter := io.Pipe()

				go func() {
					sclient := client.NewClient(&client.Config{
						Host:     connectHost,
						Port:     defaultHTTPPort,
						Insecure: insecure,
					})

					err := sclient.ListenRead(&client.ListenReadConfig{
						Channel: channel,
						Output:  incomingStreamWriter,
					})

					if err != nil {
						log.Fatal(err)
					}
				}()

				time.Sleep(time.Duration(delay) * time.Second)

				return term.NewTerm(&term.Config{
					Command:           command,
					InputToSendToTerm: inputToTermReader,
					UserStdinInput:    outStream,
					ScreenOutput:      termOutputWriter,
					Writable:          writable,
					Width:             width,
					Height:            height,
				})
			}

			stdinReader, stdinWriter := io.Pipe()
			go func() {
				_, err := io.Copy(stdinWriter, os.Stdin)
				if err != nil {
					log.Fatal(err)
				}
			}()

			sclient := client.NewClient(&client.Config{
				Host:     connectHost,
				Port:     connectPort,
				Insecure: insecure,
			})

			return sclient.Stream(&client.StreamConfig{
				Delay:   time.Duration(delay) * time.Second,
				Timeout: time.Duration(timeout) * time.Second,
				Open:    open,
				Channel: channel,
				Stdin:   stdinReader,
				Echo:    true,
			})
		},
	}

	rootCmd.SetVersionTemplate(version.String())
	rootCmd.PersistentFlags().BoolVarP(&help, "help", "", false, "Show help")

	rootCmd.Flags().StringVarP(&channel, "channel", "c", "", "Channel to stream to")
	rootCmd.Flags().StringVarP(&command, "command", "e", defaultCommand, "Command to run")
	rootCmd.Flags().IntVarP(&delay, "delay", "d", defaultDelay, "Delay in seconds before starting stream")
	rootCmd.Flags().IntVarP(&height, "height", "", height, "Static height for the TTY. By default the TTY will be resized dynamically.")
	rootCmd.Flags().StringVarP(&connectHost, "host", "h", defaultHost, "Host to connect to")
	rootCmd.Flags().BoolVarP(&insecure, "insecure", "i", true, "Set if remote host is insecure (not using HTTPS)")
	rootCmd.Flags().BoolVarP(&open, "open", "o", false, "Open the stream url in your browser")
	rootCmd.Flags().UintVarP(&connectPort, "port", "p", defaultTCPPort, "Host port")
	rootCmd.Flags().IntVarP(&timeout, "timeout", "t", defaultTimeout, "Max timeout allowed before exiting if no data is recieved after starting")
	rootCmd.Flags().IntVarP(&width, "width", "", width, "Static width for the TTY. By default the TTY will be resized dynamically.")
	rootCmd.Flags().BoolVarP(&writable, "writable", "w", false, "Allow clients to write back to the stream. Use with trusted peers only!")

	return rootCmd
}

func versionCommand() *cobra.Command {
	var versionCmd = &cobra.Command{
		Use:   "version",
		Short: "Print the version number of Streamhut",
		Long:  "Print the version number of Streamhut",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println(version.String())
		},
	}

	return versionCmd
}

func serverCommand() *cobra.Command {
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
	var noStorage bool

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
			if !noStorage {
				if dbType == "sqlite3" {
					db = sqlite3db.NewDB(&sqlite3db.Config{
						DBPath: dbPath,
					})
				}
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

			if tcpServer.BandwidthQuotaEnabled() {
				yellow.Printf("Bandwidth quota limit: %s\n", tcpServer.BandwidthQuotaLimit().String())
				yellow.Printf("Bandwidth quota duration: %s\n", tcpServer.BandwidthQuotaDuration().String())
			}
			if noStorage {
				yellow.Println("Storage disabled")
			}

			green.Printf("HTTP/WebSocket port (web): %d\n", server.Port())
			green.Printf("TCP port (streaming): %d\n", tcpServer.Port())

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

	serverCmd.Flags().StringVarP(&humanBandwidthQuotaDuration, "bandwidth-quota-duration", "", os.Getenv("BANDWIDTH_QUOTA_DURATION"), "Bandwidth quota duration (eg. 45s, 10m, 1h, 1d, 1w, etc)")
	serverCmd.Flags().StringVarP(&humanBandwidthQuotaLimit, "bandwidth-quota-limit", "", os.Getenv("BANDWIDTH_QUOTA_LIMIT"), "Bandwidth quota limit (eg. 100kb, 1mb, 1gb, etc)")
	serverCmd.Flags().StringVarP(&dbPath, "db-path", "", sqlite3db.DefaultDBPath, "Sqlite3 database path")
	serverCmd.Flags().StringVarP(&dbType, "db-type", "", "sqlite3", "Database type: Options are \"sqlite\"")
	serverCmd.Flags().UintVarP(&httpPort, "port", "p", defaultHTTPPort, "HTTP Port")
	serverCmd.Flags().UintVarP(&randomChannelLength, "random-channel-length", "", 6, "Number of characters to use for random channel generation.")
	serverCmd.Flags().StringVarP(&shareBaseURL, "share-base-url", "", defaultShareBaseURL, "Share base URL. Example: \"https://stream.ht/\"")
	serverCmd.Flags().UintVarP(&tcpPort, "tcp-port", "t", defaultTCPPort, "TCP Port")
	serverCmd.Flags().BoolVarP(&tls, "tls", "", false, "Enable TLS. Requires TLS cert and TLS key parameters.")
	serverCmd.Flags().StringVarP(&tlsCert, "tls-cert", "", "", "TLS certificate file path")
	serverCmd.Flags().StringVarP(&tlsKey, "tls-key", "", "", "TLS key file path")
	serverCmd.Flags().StringVarP(&webDir, "web-dir", "", httpserver.DefaultWebDir, "Web app directory")
	serverCmd.Flags().StringVarP(&webTarURL, "web-tar-url", "", httpserver.DefaultWebTarURL, "Web app tarball url to download")
	serverCmd.Flags().BoolVarP(&noStorage, "no-storage", "", false, "Set true to disable storage")

	return serverCmd
}

func listenCommand() *cobra.Command {
	listenCmd := &cobra.Command{
		Use:   "listen",
		Short: "(Deprecated) Use `connect` command instead",
		RunE: func(cmd *cobra.Command, args []string) error {
			return errors.New("(Deprecated) Use `connect` command instead")
		},
	}

	return listenCmd
}

func connectCommand() *cobra.Command {
	var host string
	var port uint
	var channel string
	var insecure bool

	connectCmd := &cobra.Command{
		Use:   "connect",
		Short: "Connect to a channel",
		Long:  "Connect to a channel to view streamed data",
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

	connectCmd.Flags().StringVarP(&channel, "channel", "c", "", "Channel to listen on")
	connectCmd.Flags().StringVarP(&host, "host", "h", defaultHost, "Host to run listener on")
	connectCmd.Flags().BoolVarP(&insecure, "insecure", "i", true, "Set if remote host is insecure (not using HTTPS)")
	connectCmd.Flags().UintVarP(&port, "port", "p", defaultHTTPPort, "Host port listening on")

	return connectCmd
}

// Execute ...
func Execute() {
	if os.Getenv("DEBUG") != "" {
		log.SetReportCaller(true)
	}

	rootCmd := rootCommand()
	versionCmd := versionCommand()
	serverCmd := serverCommand()
	connectCmd := connectCommand()
	listenCmd := listenCommand()

	rootCmd.AddCommand(versionCmd, serverCmd, connectCmd, listenCmd)

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
