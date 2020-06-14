package httpserver

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/streamhut/streamhut/pkg/util"
	"github.com/streamhut/streamhut/pkg/wsserver"
)

// DefaultWebTarURL is the default web build tarball url to download
var DefaultWebTarURL = "https://github.com/streamhut/web/releases/latest/download/streamhut-web.tar.gz"

// DefaultWebDir is the default web directory
var DefaultWebDir = "~/.streamhut/web"

// Config ...
type Config struct {
	Port      uint
	WS        *wsserver.WS
	WebTarURL string
	WebDir    string
	TLS       bool
	TLSCert   string
	TLSKey    string
}

// Server ...
type Server struct {
	port          uint
	ws            *wsserver.WS
	staticDirPath string
	webTarURL     string
	tls           bool
	tlsCert       string
	tlsKey        string
}

// NewServer ...
func NewServer(config *Config) *Server {
	webTarURL := DefaultWebTarURL
	if config.WebTarURL != "" {
		webTarURL = config.WebTarURL
	}

	webDir := DefaultWebDir
	if config.WebDir != "" {
		webDir = config.WebDir
	}

	return &Server{
		port:          config.Port,
		ws:            config.WS,
		webTarURL:     webTarURL,
		staticDirPath: util.NormalizePath(webDir),
		tls:           config.TLS,
		tlsCert:       config.TLSCert,
		tlsKey:        config.TLSKey,
	}
}

// Start ...
func (s *Server) Start() error {
	r := mux.NewRouter()

	if err := s.downloadWebBuildIfNotExists(); err != nil {
		return err
	}

	r.HandleFunc("/", s.indexHandler)
	r.HandleFunc("/ws/s/{channelId:[a-zA-Z0-9-]+}", s.ws.Handler) // order is important
	r.HandleFunc("/{channelId:[a-zA-Z0-9-]+}", s.channelRedirectHandler)
	r.HandleFunc("/s/{channelId:[a-zA-Z0-9-]+}", s.channelHandler)
	r.HandleFunc("/api/v1/health", s.healthCheckHandler)

	r.PathPrefix("/static/").Handler(http.StripPrefix("/", http.FileServer(http.Dir(s.staticDirPath))))

	host := fmt.Sprintf(":%d", s.port)

	srv := &http.Server{
		Handler:      r,
		Addr:         host,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	var err error
	if s.tls {
		if s.tlsCert != "" && s.tlsKey != "" {
			err = srv.ListenAndServeTLS(s.tlsCert, s.tlsKey)
		} else if s.tlsCert != "" && s.tlsKey == "" {
			return errors.New("TLS key is required")
		} else if s.tlsCert == "" && s.tlsKey != "" {
			return errors.New("TLS certificate is required")
		}
	}

	err = srv.ListenAndServe()
	if err != nil {
		if util.CheckErr(err) == util.ErrPermissionDenied {
			return errors.New("Permission denied. Try running with sudo.")
		}

		return err
	}

	return nil
}

func (s *Server) healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (s *Server) indexHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, fmt.Sprintf("%s/index.html", s.staticDirPath))
}

func (s *Server) channelHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["channelId"]
	_ = id
	if strings.Contains(r.URL.String(), ".websocket") {
		w.Write([]byte(""))
		return
	}

	http.ServeFile(w, r, fmt.Sprintf("%s/index.html", s.staticDirPath))
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

func (s *Server) downloadWebBuildIfNotExists() error {
	if _, err := os.Stat(s.staticDirPath); !os.IsNotExist(err) {
		return nil
	}

	tempFile, err := ioutil.TempFile(os.TempDir(), "")
	if err != nil {
		return err
	}

	tempFilePath := tempFile.Name()
	defer os.Remove(tempFilePath)

	if err := util.DownloadFile(s.webTarURL, tempFilePath); err != nil {
		return err
	}

	if _, err := os.Stat(s.staticDirPath); os.IsNotExist(err) {
		if err := os.MkdirAll(s.staticDirPath, 0700); err != nil {
			return err
		}
	}

	cmd := exec.Command("tar", "-zxvf", tempFilePath, "-C", s.staticDirPath, "--strip-components", "1")
	if err := cmd.Run(); err != nil {
		return err
	}

	return nil
}
