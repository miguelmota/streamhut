package sqlite3db

import (
	"database/sql"
	"log"
	"sync"
	"time"

	"github.com/streamhut/streamhut/types"
)

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
	db, err := sql.Open("sqlite3", config.DBPath+"?cache=shared&mode=rwc&_busy_timeout=5000")
	if err != nil {
		log.Fatal(err)
	}
	return &DB{
		db: db,
	}
}

/*
if (!fs.existsSync(dbPath)) {
  const schemaPath = path.resolve(__dirname, '..', 'db/schema.sql')
  db.serialize(function() {
    const lines = fs.readFileSync(schemaPath, 'utf8').split('\n').filter(x => x)
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('sqlite_sequence') > -1) {
        continue
      }
      db.run(lines[i]);
    }
  })
}
*/

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
	//insertMu.Lock()
	//defer insertMu.Unlock()
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
	//insertMu.Lock()
	//defer insertMu.Unlock()
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
