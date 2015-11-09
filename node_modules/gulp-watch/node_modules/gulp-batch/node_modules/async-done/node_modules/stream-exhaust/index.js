var Writable = require('stream').Writable;
var inherits = require('util').inherits;

module.exports = resumer

function resumer(stream) {
  if (!stream.readable) {
    return stream;
  }

  stream._read ? stream.pipe(new Sink) : stream.resume();

  return stream;
}

function Sink() {
  Writable.call(this, {
    objectMode: true
  });
}

inherits(Sink, Writable);

Sink.prototype._write = function(_, _, cb) {
  setImmediate(cb);
};
