package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"

	color "github.com/fatih/color"
	lolgopher "github.com/kris-nova/lolgopher"
	log "github.com/sirupsen/logrus"
	cobra "github.com/spf13/cobra"
	"github.com/streamhut/streamhut/cmd/streamhut/asciiart"
	"github.com/streamhut/streamhut/pkg/db"
	"github.com/streamhut/streamhut/pkg/db/sqlite3db"
	"github.com/streamhut/streamhut/pkg/httpserver"
	"github.com/streamhut/streamhut/pkg/tcpserver"
	"github.com/streamhut/streamhut/pkg/wsserver"
)

// ErrDBTypeUnsupported ...
var ErrDBTypeUnsupported = errors.New("Database type is unsupported")

var yellow = color.New(color.FgYellow).SprintFunc()
var green = color.New(color.FgGreen)

func main() {
	ioutil.ReadFile("./ascii")
	if os.Getenv("DEBUG") != "" {
		log.SetReportCaller(true)
	}

	var httpPort uint
	var tcpPort uint
	var dbPath string
	var dbType string
	var shareBaseURL string

	rootCmd := &cobra.Command{
		Use:   "streamhut",
		Short: "Streamhut",
		Long: `Streamhut lets you stream and share your terminal.
For more info, visit: https://github.com/streamhut/streamhut`,
		Run: func(cmd *cobra.Command, args []string) {
			cmd.Help()
		},
	}

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

			tcpServer := tcpserver.NewServer(&tcpserver.Config{
				WS:           ws,
				Port:         tcpPort,
				DB:           db,
				ShareBaseURL: shareBaseURL,
			})

			go func() {
				log.Fatal(tcpServer.Start())
			}()

			server := httpserver.NewServer(&httpserver.Config{
				Port: httpPort,
				WS:   ws,
			})

			handleExit(func() {
				db.Close()
			})

			lolwriter := lolgopher.NewTruecolorLolWriter()
			lolwriter.Write([]byte(asciiart.Hut()))
			fmt.Println("\nStarting server...")
			green.Printf("HTTP/WebSocket port: %d\n", server.Port())
			green.Printf("TCP port: %d\n", tcpServer.Port())
			return server.Start()
		},
	}

	serverCmd.Flags().UintVarP(&httpPort, "port", "p", 8080, "HTTP Port")
	serverCmd.Flags().UintVarP(&tcpPort, "tcp-port", "t", 1337, "TCP Port")
	serverCmd.Flags().StringVarP(&dbPath, "db-path", "", "./data/sqlite3.db", "Sqlite3 database path")
	serverCmd.Flags().StringVarP(&dbType, "db-type", "", "sqlite3", "Database type: Options are \"sqlite\"")
	serverCmd.Flags().StringVarP(&shareBaseURL, "share-base-url", "", "", "Share base URL. Example: \"https://stream.ht/\"")

	rootCmd.AddCommand(serverCmd)

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
		fmt.Printf("Caught signal: %+v\n%s", sig, yellow("Shutting down..."))
		cb()
		os.Exit(0)
	}()
}
