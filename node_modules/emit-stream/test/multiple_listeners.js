var test = require('tap').test;

var emitStream = require('../');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var JSONStream = require('JSONStream');


test('emit to multiple listeners, close first', function(t) {
    t.plan(2);

    var duration = 50, events = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var server = JSONStreamServer(function() {
        return emitLinear(new EventEmitter, 'ping', events, duration);
    });

    server.listen(5555);

    server.on('listening', function() {
        var s1_events = [], s2_events = [];
        var s1_stream, s2_stream;

        toEmitJSONStream(s1_stream = net.connect(5555)).on('ping', function(x) {
            s1_events.push(x);
        });
        setTimeout(function() {
            s1_stream.end();
        }, duration * 6.5 );

        setTimeout(function() {
            toEmitJSONStream(s2_stream = net.connect(5555)).on('ping', function(x) {
                s2_events.push(x);
            });
        }, duration * 3.5);

        setTimeout(function() {
            t.same(s1_events, [1, 2, 3, 4, 5, 6]);
            t.same(s2_events, [4, 5, 6, 7, 8, 9, 10]);
            s2_stream.end();
        }, duration * (events.length + 1));
    });


    t.on('end', function() {
        server.close();
    })

});


function JSONStreamServer(createEmitter) {
    var ev;

    var server = net.createServer(function (stream) {
        if (!ev) ev = createEmitter();
        var es = emitStream(ev);

        es.pipe(JSONStream.stringify()).pipe(stream);

        stream.on('end', function() { es.end(); });
    });
    server.on('close', function () { ev.stop && ev.stop() });

    return server;
}

function emitLinear(ev, event_type, xs, duration) {
    xs = xs.slice().reverse();

    var iv = setInterval(function() {
        xs.length ? ev.emit(event_type, xs.pop()) : clearInterval(iv);
    }, duration);

    return ev;
}

function toEmitJSONStream(stream) {
    return emitStream(stream.pipe(JSONStream.parse([true])));
}

