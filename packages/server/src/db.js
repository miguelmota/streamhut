const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const dbPath = path.resolve(__dirname, '..', 'db/db.sqlite3')
const schemaPath = path.resolve(__dirname, '..', 'db/schema.sql')
const db = new sqlite3.Database(dbPath);

if (!fs.existsSync(dbPath)) {
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

module.exports.readStreamLogs = (handle) => {
  return new Promise((resolve) => {
    db.all("SELECT rowid AS id, data, created_at FROM stream_logs WHERE stream_handle = ?", [handle], function(err, rows) {
      resolve(rows)
    });
  })
}

module.exports.readStreamMessages = (handle) => {
  return new Promise((resolve) => {
    db.all("SELECT rowid AS id, message, mime, created_at FROM stream_messages WHERE stream_handle = ?", [handle], function(err, rows) {
      resolve(rows)
    });
  })
}

module.exports.insertStreamLog = (handle, data) => {
  var stmt = db.prepare("INSERT INTO stream_logs(stream_handle, data) VALUES (?, ?)");
  stmt.run(handle, data);
  stmt.finalize();
}

module.exports.insertStreamMessage = (handle, data, mime) => {
  var stmt = db.prepare("INSERT INTO stream_messages(stream_handle, message, mime) VALUES (?, ?, ?)");
  stmt.run(handle, data, mime);
  stmt.finalize();
}
