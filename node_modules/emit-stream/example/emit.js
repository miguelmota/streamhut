var emitStream = require('../');
var EventEmitter = require('events').EventEmitter;
var JSONStream = require('JSONStream');
var net = require('net');

var server = (function () {
    var ev = createEmitter();
    
    return net.createServer(function (stream) {
        emitStream(ev)
            .pipe(JSONStream.stringify())
            .pipe(stream)
        ;
    });
})();
server.listen(5555);

server.on('listening', function () {
    var stream = net.connect(5555)
        .pipe(JSONStream.parse([true]))
    ;
    var ev = emitStream(stream);
    
    ev.on('ping', function (t) {
        console.log('# ping: ' + t);
    });
    
    ev.on('x', function (x) {
        console.log('x = ' + x);
    });
});

function createEmitter () {
    var ev = new EventEmitter;
    setInterval(function () {
        ev.emit('ping', Date.now());
    }, 2000);
    
    var x = 0;
    setInterval(function () {
        ev.emit('x', x ++);
    }, 500);
    
    return ev;
}
