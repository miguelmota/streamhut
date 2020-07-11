module github.com/streamhut/streamhut

go 1.14

replace github.com/mattn/go-sqlite3 => github.com/miguelmota/go-sqlite3 v1.14.1-0.20200712070848-bd8c8d9fa5ce

require (
	github.com/creack/pty v1.1.11
	github.com/fatih/color v1.9.0
	github.com/gorilla/mux v1.7.4
	github.com/gorilla/websocket v1.4.2
	github.com/kris-nova/lolgopher v0.0.0-20180921204813-313b3abb0d9b
	github.com/mattn/go-sqlite3 v0.0.0-00010101000000-000000000000
	github.com/patrickmn/go-cache v2.1.0+incompatible
	github.com/satori/go.uuid v1.2.0
	github.com/sirupsen/logrus v1.6.0
	github.com/spf13/cobra v1.0.0
	golang.org/x/crypto v0.0.0-20200709230013-948cd5f35899
)
