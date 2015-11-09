var vows = require("vows");
var assert = require("assert");
var index = require("../index");

function createTestReadStream(options){
    return new index.BufferReadStream(new Buffer("jibberish"), options);
}

function createTestWriteStream(options){
    return new index.BufferWriteStream(options);
}

vows.describe("Buffer IO Streams").addBatch({
    
    "BufferReadStream Test":{
        
        "Single Chunk Data Emission":{
            topic: function(){
                var stream = createTestReadStream();
                var callback = this.callback;
                stream.on("data", function(data){
                    callback(null, data);
                });
            },
            "should receive all": function(data){
                assert.isTrue(Buffer.isBuffer(data));
                assert.equal(data.toString(), "jibberish");
            }
        },
        
        "Single Chunk End Emission":{
            topic: function(){
                var stream = createTestReadStream();
                stream.on("end", this.callback);
            },
            "should be called": function(){}
        },
        
        "Multiple Chunk Data Emissions":{
            topic: function(){
                
                var stream = createTestReadStream({
                    chunkSize: 4
                });
                
                var callback = this.callback;
                var chunks = 0;
                
                stream.on("data", function(data){
                    
                    [
                        function(){
                            if(data.toString() != "jibb"){
                                callback("chunk 1 incorrect");
                            }
                        },
                        function(){
                            if(data.toString() != "eris"){
                                callback("chunk 2 incorrect");
                            }
                        },
                        function(){
                            if(data.toString() != "h"){
                                callback("chunk 3 incorrect");
                            }
                            
                            callback(null, new Buffer("jibberish"));
                        }
                    ][chunks]();
                    
                    chunks += 1;
                });
            },
            "should receive all": function(data){
                assert.isTrue(Buffer.isBuffer(data));
                assert.equal(data.toString(), "jibberish");
            }
        },
        
        "Multiple Chunk End Emission":{
            topic: function(){
                
                var stream = createTestReadStream({
                    chunkSize: 4
                });
                
                var callback = this.callback;
                
                stream.on("end", function(){
                    callback();
                });
            },
            "should be called": function(){}
        },
        
        "Chunk size greater than Buffer length":{
            topic: function(){
                
                var stream = createTestReadStream({
                    chunkSize: 100
                });
                
                var callback = this.callback;
                
                stream.on("data", function(data){
                    callback(null, data);
                });
            },
            "doesn't over-read": function(data){
                assert.equal(data.length, 9);
                assert.equal(data.toString(), "jibberish");
            }
        },
        
        "Long read time": {
            topic: function(){
                
                var stream = createTestReadStream({
                    chunkSize: 4,
                    readDelay: 10
                });
                
                var callback = this.callback;
                var dataBuffer = "";
                
                stream.on("data", function(data){
                    dataBuffer += data.toString();
                });
                
                stream.on("end", function(){
                    if(dataBuffer != "jibberish"){
                        callback("chunks incorrect");
                    }
                    callback();
                });
            },
            "should end": function(){}
        },
        
        "Paused": {
            topic: function(){
                
                var stream = createTestReadStream({
                    paused: true
                });
                
                var callback = this.callback;
                
                stream.on("data", function(){
                    callback("not paused");
                });
                
                stream.on("end", function(){
                    callback("not paused");
                });
                
                setTimeout(function(){
                    callback();
                }, 1);
            },
            "should timeout": function(){}
        },
        
        "Read, Pause and Resume":{
            topic: function(){
                
                var stream = createTestReadStream({
                    chunkSize: 1
                });
                
                var callback = this.callback;
                var dataBuffer = "";
                
                stream.on("data", function(data){
                    
                    dataBuffer += data.toString();
                    
                    stream.pause();
                    
                    process.nextTick(function(){
                       stream.resume();
                    });
                });
                
                stream.on("end", function(){
                    if(dataBuffer != "jibberish"){
                        callback("chunks incorrect");
                    }
                    callback();
                });
            },
            "should end": function(){}
        },
        
        "End": {
            topic: function(){
                
                var stream = createTestReadStream();
                
                var callback = this.callback;
                
                stream.on("end", function(){
                    callback(null, stream);
                });
            },
            "should be unreadable": function(stream){
                assert.isFalse(stream.readable);
            }
        },
        
        "Destroy": {
            topic: function(){
                
                var stream = createTestReadStream();
                var callback = this.callback;
                
                stream.on("data", function(){
                    callback("should not have received data event");
                });
                
                stream.on("end", function(){
                    callback("should not have received end event");
                });
                
                stream.destroy();
                
                setTimeout(function(){
                    callback(null, stream);
                }, 1);
            },
            "should timeout": function(){},
            "should be unreadable": function(stream){
                assert.isFalse(stream.readable);
            }
        },
        
        "Ascii Encoding":{
            topic: function(){
                var stream = createTestReadStream();
                stream.setEncoding("ascii");
                var callback = this.callback;
                stream.on("data", function(data){callback(null, data);});
            },
            "should receive ascii string": function(data){
                assert.equal(data, "jibberish");
            }
        }
    },
    
    "BufferWriteStream Test":{
        
        "Instant Commits":{
            topic: function(){
                
                var stream = createTestWriteStream({
                    minBlockAllocSize:2
                });
                
                return stream.write("J") && stream.write("i");
            },
            "should return true": function(value){
                assert.isTrue(value);
            }
        },
        
        "Pending Commits":{
            topic: function(){
                
                var stream = createTestWriteStream();
                var callback = this.callback;
                
                if(stream.write("Jibberish")){
                    callback("expecting delayed commit");
                }
                
                stream.on("drain", function(){
                    callback(null, stream);
                });
            },
            "should drain": function(){},
            "count bytes written": function(stream){
                assert.equal(stream.bytesWritten, 9);
            },
            "data written": function(stream){
                assert.equal(stream.getBuffer().toString(), "Jibberish");
            }
        },
        
        "No events after destroy":{
            topic: function(){
                
                var stream = createTestWriteStream();
                var callback = this.callback;
                
                stream.write("Jibberish");
                
                stream.on("drain", function(){
                    callback("should not have received drain event");
                });
                
                stream.on("error", function(){
                    callback("should not have received error event");
                });
                       
                stream.destroy();
                
                setTimeout(function(){
                    callback(null, stream);
                }, 1);
            },
            "should timeout": function(){},
            "should not be writable": function(stream){
                assert.isFalse(stream.writable);
            },
            "should have zero bytes written": function(stream){
                assert.equal(stream.bytesWritten, 0);
            }
        },
        
        "onFull":{
            topic: function(){
                
                var callback = this.callback;
                
                var stream = createTestWriteStream({
                    onFull:function(){
                        process.nextTick(callback);
                    }
                });
                
                stream.write("test");
            },
            "should be called": function(){}
        },
              
        "onEnd": {
            topic: function(){
                
                var callback = this.callback;
                
                var stream = createTestWriteStream({
                    onEnd: function(){
                        process.nextTick(function(){
                            callback(null, stream);
                        });
                    }
                });
                
                stream.end("Jibberish");
            },
            "should not be writable": function(stream){
                assert.isFalse(stream.writable);
            },
            "has written data": function(stream){
                assert.equal(stream.getBuffer().toString(), "Jibberish");
                assert.equal(stream.bytesWritten, 9);
            }
        },
        
        "grow buffer":{
            topic: function(){
                
                var callback = this.callback;
                
                var stream = createTestWriteStream({
                    onFull:function(buffer, extraSize, callback){
                        var newBuffer = new Buffer(buffer.length + extraSize);
                        buffer.copy(newBuffer);
                        callback(newBuffer, newBuffer.slice(buffer.length));
                    }
                });
                
                stream.write("Jibberish");
                
                stream.on("drain", function(){
                    callback(null, stream);
                });
            },
            "should drain": function(){},
            "data written": function(stream){
                assert.equal(stream.getBuffer().toString(), "Jibberish");
            }
        },
        
        "Flow control":{
            topic:function(){
                
                var callback = this.callback;
                
                var stream = createTestWriteStream({
                    onEnd: function(){
                        process.nextTick(function(){
                            callback(null, stream);
                        });
                    }
                });
                
                stream.on("drain", dequeue);
                
                var queue = ["First", "Second", "Third"];
                
                function dequeue(){
                    
                    if(!queue.length){
                        stream.end();
                        return;
                    }
                    
                    if(stream.write(queue.shift())){
                        callback("should not have committed");
                    }
                }
                
                dequeue();
            },
            "data written": function(stream){
                
                assert.equal(stream.bytesWritten, 16);
                assert.equal(stream.getBuffer().toString(), "FirstSecondThird");
            }
        },
        
        "No write queue":{
            topic: function(){
                
                var stream = createTestWriteStream({
                    minBlockAllocSize: 9
                });
                
                return [stream.write("jibberish"), stream];
            },
            "write should return true": function(value){
                assert.isTrue(value[0]);
            },
            "data should be written to buffer": function(value){
                assert.equal(value[1].getBuffer().toString(), "jibberish");
                assert.equal(value[1].bytesWritten, 9);
            },
            "stream should be writeable":function(value){
                assert.isTrue(value[1].writable);
            }
        },
        
        "consume onWrite": {
            topic: function(){
                
                var callback = this.callback;
                
                var stream = createTestWriteStream({
                    onWrite: function(continuation, thisCallback){
                        
                        this.consume(this.getCommittedSlice().length);
                        
                        continuation(thisCallback);
                        
                        process.nextTick(function(){
                           callback(null, stream);
                        });
                    }
                });
                
                stream.write("jibberish");
            },
            "should have empty buffer": function(stream){
                assert.equal(stream.getBuffer().length, 0);
            },
            "should be writable": function(stream){
                assert.isTrue(stream.writable);
            },
            "should have bytes written": function(stream){
                assert.equal(stream.bytesWritten, 9);
            }
        },
        
        "chunked write": {
            topic: function(){
                
                var callback = this.callback;
                
                var lastCommitLength = 0;
                
                var stream = createTestWriteStream({
                    
                    maxBlockAllocSize: 4,
                    
                    onWrite: function(callback, thisCallback){
                        
                        var committedSlice = this.getCommittedSlice();
                        
                        if(committedSlice.length - lastCommitLength > 4){
                            callback("chunk size too large");
                        }
                        
                        lastCommitLength = committedSlice.length;
                        
                        callback(thisCallback);
                    }
                });
                
                if(!stream.write("jibberish")){
                    stream.on("drain", function(){
                       callback(null, stream);
                    });
                }
                else{
                    callback("was expecting write to return false");
                }
            },
            "data written": function(stream){
                assert.equal(stream.getCommittedSlice().toString(), "jibberish");
            },
            "bytes written": function(stream){
                assert.equal(stream.bytesWritten, 9);
            }
        }
    }
})["export"](module);
