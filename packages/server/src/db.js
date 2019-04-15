const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const dbPath = path.resolve(__dirname, '..', 'db/db.sqlite3')
const initialDbPath = path.resolve(__dirname, '..', 'db/db.example.sqlite3')
if (!fs.existsSync(dbPath)) {
  fs.createReadStream(initialDbPath).pipe(fs.createWriteStream(dbPath));
}

const db = new sqlite3.Database(dbPath);

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
