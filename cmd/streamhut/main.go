package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/streamhut/streamhut/pkg/db"
	"github.com/streamhut/streamhut/pkg/db/sqlite3db"
	"github.com/streamhut/streamhut/pkg/httpserver"
	"github.com/streamhut/streamhut/pkg/tcpserver"
	"github.com/streamhut/streamhut/pkg/wsserver"
)

func main() {
	dbtype := "sqlite3"
	var db db.DB
	if dbtype == "sqlite3" {
		db = sqlite3db.NewDB(&sqlite3db.Config{
			DBPath: "./data/sqlite3.db",
		})
	}
	ws := wsserver.NewWS(&wsserver.Config{
		DB: db,
	})
	tcpServer := tcpserver.NewServer(&tcpserver.Config{
		WS:   ws,
		Port: 1337,
		DB:   db,
	})

	go tcpServer.Start()

	server := httpserver.NewServer(&httpserver.Config{
		Port: 8080,
		WS:   ws,
	})

	var gracefulStop = make(chan os.Signal)
	signal.Notify(gracefulStop, syscall.SIGTERM)
	signal.Notify(gracefulStop, syscall.SIGINT)
	go func() {
		sig := <-gracefulStop
		fmt.Printf("caught sig: %+v\nshutting down...", sig)
		db.Close()
		os.Exit(0)
	}()

	server.Start()
}
