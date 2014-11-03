var _ = require("underscore");
var bufferStreamModule = require("./buffer_stream");
var BufferWriteStream = bufferStreamModule.BufferWriteStream;

function ProactiveReadStream(source, writeStreamOptions){
    
    var self = this;
    
    function consumer(callback){
        if(self._readCompletionCondition){
            self._completeReadOperation();
        }
        callback(consumer);
    }
    
    function onEnd(){
        self.cancel("end of stream");
    }
    
    this._writeStream = new BufferWriteStream(_.extend(writeStreamOptions || {},{
        onWrite: consumer,
        onEnd: onEnd
    }));
    
    source.pipe(this._writeStream);
}

ProactiveReadStream.prototype._completeReadOperation = function(){
    
    if(!this._readCompletionCondition){
        return;
    }
    
    var consume = 0;
    
    var committedSlice = this._writeStream.getCommittedSlice();
    
    consume = this._readCompletionCondition(committedSlice);
    
    if(consume){
        
        var consumedSlice = committedSlice.slice(0, consume);
        
        this._writeStream.consume(consume);
        
        this._readCompletionCondition = null;
        
        if(this._readCompletionCallback){
            
            var completionCallback = this._readCompletionCallback;
            this._readCompletionCallback = null;
            
            completionCallback(consumedSlice);
        }
    }
};

ProactiveReadStream.prototype.read = function(condition, callback){
    
    if(condition === null){
        condition = everything();
    }
    else if(condition.constructor === Number){
        condition = bytes(condition);
    }
    else if(condition.constructor === String){
        condition = until(condition);
    }
    
    if(this._readCompletionCondition){
        throw new Error("read operation in progress");
    }
    
    this._readCompletionCondition = condition;
    this._readCompletionCallback = callback;
    
    var self = this;
    process.nextTick(function(){
        self._completeReadOperation();
    });
};

ProactiveReadStream.prototype.cancel = function(message){
    
    message = message || "operation cancelled";
    
    this._readCompletionCondition = null;
    
    if(this._readCompletionCallback){
        
        var callback = this._readCompletionCallback;
        this._readCompletionCallback = null;
        
        callback(null, new Error(message));
    }
};

function everything(){
    return function(buffer){
        return buffer.length;
    };
}

function bytes(n){
    return function(buffer){
        if(buffer.length >= n){
            return n;
        }
        else{
            return 0;
        }
    };
}

function until(delimiter, encoding){
    
    if(!Buffer.isBuffer(delimiter)){
        delimiter = new Buffer(delimiter, encoding);
    }
    
    var delimiterLength = delimiter.length;
    var bufferIndex = 0;
    
    return function(buffer){
        
        var end = buffer.length - delimiterLength + 1;
        var match;
        
        for(; bufferIndex < end; bufferIndex++){
            
            match = true;
            
            for(var i = 0; i < delimiterLength; i++){
                if(delimiter[i] !== buffer[bufferIndex + i]){
                    match = false;
                    break;
                }
            }
            
            if(match){
                var consume = bufferIndex + delimiterLength;
                bufferIndex = 0;
                return consume;
            }
        }
        
        return 0;
    };
}

exports.ProactiveReadStream = ProactiveReadStream;
exports.bytes = bytes;
exports.until = until;
exports.everything = everything;
