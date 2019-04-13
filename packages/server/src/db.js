var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/db.sqlite3');

db.serialize(function() {
  /*
  db.each("SELECT rowid AS id, data FROM stream_logs", function(err, row) {
      console.log(row.id, row.data);
  });
  */
});

//db.close();

module.exports.readStreamLogs = (handle) => {
  return new Promise((resolve) => {
    db.all("SELECT rowid AS id, data FROM stream_logs WHERE stream_handle = ?", [handle], function(err, rows) {
      resolve(rows)
    });
  })
}

module.exports.readStreamMessages = (handle) => {
  return new Promise((resolve) => {
    db.all("SELECT rowid AS id, message, mime FROM stream_messages WHERE stream_handle = ?", [handle], function(err, rows) {
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
