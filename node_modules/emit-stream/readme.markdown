# emit-stream

turn event emitters into streams and streams into event emitters

[![build status](https://secure.travis-ci.org/substack/emit-stream.png)](http://travis-ci.org/substack/emit-stream)

![emit stream explained](http://substack.net/images/emit_stream.gif)

# example

write a server that streams an event emitter's events to clients:

``` js
var emitStream = require('emit-stream');
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

var EventEmitter = require('events').EventEmitter;

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
```

then re-constitute the event-emitters on the client:

``` js
var emitStream = require('emit-stream');
var net = require('net');

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
```

***

```
$ node example/emit.js 
x = 0
x = 1
x = 2
x = 3
# ping: 1346116850523
x = 4
x = 5
^C
```

# methods

``` js
var emitStream = require('emit-stream')
```

## emitStream(x)

If `x` is a stream, returns an event emitter from `emit.toStream(x)`.

Otherwise returns a stream from `emit.fromStream(x)`.

## emitStream.toStream(emitter)

Return a stream from the EventEmitter `emitter`.

The `'data'` emitted by this stream will be array data.
Serialization is up to you. I recommend
[JSONStream](http://github.com/dominictarr/JSONStream)
for most purposes.

## emitStream.fromStream(stream)

Return an EventEmitter from `stream`.

The `'data'` written to this stream should be an array, like
[JSONStream](http://github.com/dominictarr/JSONStream) creates.

# install

With [npm](http://npmjs.org) do:

```
npm install emit-stream
```

# license

MIT
