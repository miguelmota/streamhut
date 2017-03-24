'use strict';

const fs = require(`fs`);
const randomstring = require(`randomstring`);
const shoe = require(`shoe`);
const http = require(`http`);
const through = require(`through`);

process.setMaxListeners(0);

const ecstatic = require(`ecstatic`)(`${__dirname}/static`);
const socks = {};

function genRandString() {
  return randomstring.generate({
    length: 3,
    capitalization: `lowercase`
  });
}

function callback(req, res) {
  const path = req.url;

  // index
  if (/^\/$/.test(path)) {
    let Location = null;

    // generate different path id if already being used
    do {
      const randString = genRandString();
      Location = `/${randString}`;
    } while (socks[Location] && socks[Location].clients.length);

    res.writeHead(301, {Location});
    res.end();
    return;
  }

  // assets
  if (/\.+/.test(path)) {
    ecstatic.apply(this, arguments);
  } else {
    if (!socks[path]) {
      socks[path] = createSock(path);
    }

    const stream = fs.createReadStream(`${__dirname}/static/index.html`);
    stream.pipe(res);
  }
}

function createSock(path) {
  const clients = [];
  const sock = shoe(stream => {
    stream
    .pipe(through((data, bar) => {
      //console.log(`\n${path}\n---${data}---`);
      clients.forEach(client => {
        console.log(`streaming to ${client.id} ${path}`);
        client.write(data);
      });
    }))
    .on(`end`, () => {
      console.log(`end`);
    });

    //stream.pipe(process.stdout, {end:false});
  });

  sock.on(`connection`, conn => {
    clients.push(conn);
    console.log(`connected ${conn.id} ${path}`);

    const sendConnections = () => {
      clients.forEach(client => {
        client.write(JSON.stringify({
          __server_message__: {
          data: {
            connectionId: conn.id,
            connections: clients.map(client => {
              return {id: client.id}
            })
            .filter(x => (x.id !== conn.id))
          }
        }}));
      });
    }

    sendConnections();

    conn.on(`close`, function() {
      console.log(`close ${conn.id}`);
      clients.splice(clients.indexOf(conn), 1);
      sendConnections();
    });
  });

  sock.install(server, `${path}___`);
  sock.clients = clients;

  return sock;
}


const server = http.createServer(callback);
const port = process.env.PORT || 8956;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
