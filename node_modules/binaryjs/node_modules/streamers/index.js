
var bufferStreamModule = require("./lib/buffer_stream");
var proactiveReadStreamModule = require("./lib/proactive_read_stream");

exports.BufferReadStream = bufferStreamModule.BufferReadStream;
exports.BufferWriteStream = bufferStreamModule.BufferWriteStream;

exports.ProactiveReadStream = proactiveReadStreamModule.ProactiveReadStream;
