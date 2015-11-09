var fs = require('fs');
var randomstring = require('randomstring');
var shoe = require('shoe');
var http = require('http');
var _ = require('lodash');
var through = require('through');

process.setMaxListeners(0);

var clients = [];

var ecstatic = require('ecstatic')(__dirname + '/static');

var server = http.createServer(function(req, res) {
  var path = req.url;
  if (/^\/$/.test(path)) {
    res.writeHead(301, {
      'Location': ['/', randomstring.generate(6)].join('')
    });
    res.end();
    return;
  }
  if (/\.+/.test(path)) {
    ecstatic.apply(this, arguments);
  } else {
    console.log(path);
    var stream = fs.createReadStream(__dirname + '/static/index.html');
    stream.pipe(res);
  }
});

var sock = shoe(function (stream) {
    stream.on('end', function () {
      console.log('end');
    });
    stream.pipe(through(function(d) {
      console.log('\n', d + '---');
      _.each(clients, function(client) {
          client.write(d);
      });
    }));

    stream.pipe(process.stdout, { end : false });
});

sock.on('connection', function(conn) {
  clients.push(conn);
  console.log('connected');
  console.log(conn.remoteAddress);
  console.log(conn.remotePort);
  console.log(conn.id);
  conn.on('close', function() {
    console.log('close');
    clients.splice(clients.indexOf(conn), 1);
  });
});

sock.install(server, '/s');
server.listen(8956);
