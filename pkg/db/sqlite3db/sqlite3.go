package sqlite3db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/streamhut/streamhut/pkg/util"
	"github.com/streamhut/streamhut/types"
)

// DefaultDBPath is the default path for the sqlite3 database
var DefaultDBPath = "~/.streamhut/db/sqlite3.db"

// Config ...
type Config struct {
	DBPath string
}

// DB ...
type DB struct {
	db *sql.DB
}

// NewDB ...
func NewDB(config *Config) *DB {
	dbPath := util.NormalizePath(config.DBPath)

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		dbDirPath := util.FilePath(dbPath)
		if _, err := os.Stat(dbDirPath); os.IsNotExist(err) {
			if err := os.MkdirAll(dbDirPath, 0700); err != nil {
				log.Fatal(err)
			}
		}

		f, err := os.Create(dbPath)
		if err != nil {
			log.Fatal(err)
		}

		f.Close()
	}

	db, err := sql.Open("sqlite3", fmt.Sprintf("%s?cache=shared&mode=rwc&_busy_timeout=5000", dbPath))
	if err != nil {
		log.Fatal(err)
	}

	svc := &DB{
		db: db,
	}

	for _, line := range svc.schema() {
		if len(line) < 3 {
			continue
		}

		tx, err := db.Begin()
		if err != nil {
			log.Fatal(err)
		}
		stmt, err := tx.Prepare(line)
		if err != nil {
			log.Fatal(err)
		}
		defer stmt.Close()
		_, err = stmt.Exec()
		if err != nil {
			log.Fatal(err)
		}
		if err := tx.Commit(); err != nil {
			if err := tx.Rollback(); err != nil {
				log.Fatal(err)
			}
		}
	}

	return svc
}

// Close ...
func (d *DB) Close() error {
	return d.db.Close()
}

// ReadStreamLogs ...
func (d *DB) ReadStreamLogs(handle string) []*types.StreamLog {
	q := "SELECT rowid AS id, data, created_at FROM stream_logs WHERE stream_handle = ?"
	rows, err := d.db.Query(q, handle)
	if err != nil {
		log.Fatal(err)
	}
	var logs []*types.StreamLog
	defer rows.Close()
	for rows.Next() {
		var id int
		var data []byte
		var createdAt time.Time
		err = rows.Scan(&id, &data, &createdAt)
		if err != nil {
			log.Fatal(err)
		}
		logs = append(logs, &types.StreamLog{
			ID:        id,
			Data:      data,
			CreatedAt: createdAt,
		})
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	return logs
}

// ReadStreamMessages ...
func (d *DB) ReadStreamMessages(handle string) []*types.StreamMessage {
	q := "SELECT rowid AS id, message, mime, created_at FROM stream_messages WHERE stream_handle = ?"
	rows, err := d.db.Query(q, handle)
	if err != nil {
		log.Fatal(err)
	}
	var messages []*types.StreamMessage
	defer rows.Close()
	for rows.Next() {
		var id int
		var message []byte
		var mime string
		var createdAt time.Time
		err = rows.Scan(&id, &message, &mime, &createdAt)
		if err != nil {
			log.Fatal(err)
		}
		messages = append(messages, &types.StreamMessage{
			ID:        id,
			Message:   message,
			Mime:      mime,
			CreatedAt: createdAt,
		})
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	return messages
}

var insertMu sync.Mutex

// InsertStreamLog ...
func (d *DB) InsertStreamLog(vLog *types.StreamLog) {
	insertMu.Lock()
	defer insertMu.Unlock()
	tx, err := d.db.Begin()
	if err != nil {
		log.Fatal(3, err)
	}
	stmt, err := tx.Prepare(`
	INSERT INTO
		stream_logs(stream_handle, data)
	VALUES (?, ?)
	`)
	if err != nil {
		log.Fatal(2, err)
	}
	defer stmt.Close()
	_, err = stmt.Exec(vLog.Channel, vLog.Data)
	if err != nil {
		log.Fatal(1, err)
	}
	if err := tx.Commit(); err != nil {
		if err := tx.Rollback(); err != nil {
			log.Fatal(6, err)
		}
	}
}

// InsertStreamMessage ...
func (d *DB) InsertStreamMessage(msg *types.StreamMessage) {
	insertMu.Lock()
	defer insertMu.Unlock()
	tx, err := d.db.Begin()
	if err != nil {
		log.Fatal(3, err)
	}
	stmt, err := tx.Prepare(`
	INSERT INTO
		stream_messages(stream_handle, message, mime)
	VALUES (?, ?, ?)
	`)
	if err != nil {
		log.Fatal(2, err)
	}
	defer stmt.Close()
	_, err = stmt.Exec(msg.Channel, msg.Message, msg.Mime)
	if err != nil {
		log.Fatal(1, err)
	}
	if err := tx.Commit(); err != nil {
		if err := tx.Rollback(); err != nil {
			log.Fatal(6, err)
		}
	}
}

func (d *DB) schema() []string {
	schema := `
		CREATE TABLE IF NOT EXISTS "schema_migrations" ("version" varchar NOT NULL PRIMARY KEY);
		CREATE TABLE IF NOT EXISTS "ar_internal_metadata" ("key" varchar NOT NULL PRIMARY KEY, "value" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
		CREATE TABLE IF NOT EXISTS "stream_logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "stream_handle" blob NOT NULL, "data" blob NOT NULL, "created_at" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL);
		CREATE INDEX IF NOT EXISTS "index_stream_logs_on_stream_handle" ON "stream_logs" ("stream_handle");
		CREATE INDEX IF NOT EXISTS "index_stream_logs_on_data" ON "stream_logs" ("data");
		CREATE INDEX IF NOT EXISTS "index_stream_logs_on_created_at" ON "stream_logs" ("created_at");
		CREATE TABLE IF NOT EXISTS "stream_messages" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "stream_handle" blob NOT NULL, "message" blob NOT NULL, "mime" blob NOT NULL, "created_at" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL);
		CREATE INDEX IF NOT EXISTS "index_stream_messages_on_stream_handle" ON "stream_messages" ("stream_handle");
		CREATE INDEX IF NOT EXISTS "index_stream_messages_on_mime" ON "stream_messages" ("mime");
		CREATE INDEX IF NOT EXISTS "index_stream_messages_on_data" ON "stream_messages" ("data");
		CREATE INDEX IF NOT EXISTS "index_stream_messages_on_created_at" ON "stream_messages" ("created_at");
	`

	return strings.Split(schema, "\n")
}
