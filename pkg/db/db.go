package db

import (
	_ "github.com/mattn/go-sqlite3" // required
	"github.com/streamhut/streamhut/types"
)

// DB ...
type DB interface {
	Close() error
	ReadStreamLogs(handle string) []*types.StreamLog
	ReadStreamMessages(handle string) []*types.StreamMessage
	InsertStreamLog(vLog *types.StreamLog)
	InsertStreamMessage(msg *types.StreamMessage)
}
