package httpserver

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/streamhut/streamhut/pkg/wsserver"
)

// Config ...
type Config struct {
	Port uint
	WS   *wsserver.WS
}

// Server ...
type Server struct {
	port uint
	ws   *wsserver.WS
}

// NewServer ...
func NewServer(config *Config) *Server {
	return &Server{
		port: config.Port,
		ws:   config.WS,
	}
}

// Start ...
func (s *Server) Start() error {
	r := mux.NewRouter()

	r.HandleFunc("/", s.indexHandler)
	r.HandleFunc("/ws/s/{channelId:[a-zA-Z0-9-]+}", s.ws.Handler) // order is important
	r.HandleFunc("/{channelId:[a-zA-Z0-9-]+}", s.channelRedirectHandler)
	r.HandleFunc("/s/{channelId:[a-zA-Z0-9-]+}", s.channelHandler)
	r.HandleFunc("/api/v1/health", s.healthCheckHandler)

	r.PathPrefix("/static/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("static"))))

	host := fmt.Sprintf(":%d", s.port)

	srv := &http.Server{
		Handler:      r,
		Addr:         host,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	return srv.ListenAndServe()
}

func (s *Server) healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (s *Server) indexHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/index.html")
}

func (s *Server) channelHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["channelId"]
	_ = id
	fmt.Println("W")
	if strings.Contains(r.URL.String(), ".websocket") {
		w.Write([]byte(""))
		return
	}

	http.ServeFile(w, r, "static/index.html")
}

// channelRedirectHandler redirects "/{channel}" to "/s/{channel}"
func (s *Server) channelRedirectHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["channelId"]
	_ = id
	http.Redirect(w, r, "/s"+r.URL.String(), http.StatusTemporaryRedirect)
}

// Port ...
func (s *Server) Port() uint {
	return s.port
}
