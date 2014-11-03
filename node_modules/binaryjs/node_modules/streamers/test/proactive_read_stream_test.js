var vows = require("vows");
var assert = require("assert");
var index = require("../index");

vows.describe("Proactor Read Operations").addBatch({
    
    "ProactiveReadStream Test":{
        
        "Read Number of Bytes":{
            topic: function(){
                
                var callback = this.callback;
                
                var source = new index.BufferReadStream(new Buffer("jibberish"), {chunkSize: 4});
                var reader = new index.ProactiveReadStream(source);
                
                function firstRead(){
                    reader.read(2, function(data, error){
                        if(data){
                            if(data.toString() == "ji"){
                                secondRead();
                            }
                            else{
                                callback("first read returned wrong data");
                            }
                        }
                        else{
                            callback(error);
                        }
                    });
                }
                
                function secondRead(){
                    reader.read(4, function(data, error){
                        if(data){
                            if(data.toString() == "bber"){
                                thirdRead();
                            }
                            else{
                                callback("second read returned wrong data");
                            }
                        }
                        else{
                            callback(error);
                        }
                    });
                }
                
                function thirdRead(){
                    reader.read(3, function(data, error){
                        if(data){
                            if(data.toString() == "ish"){
                                callback();
                            }
                            else{
                                callback("third read returned wrong data");
                            }
                        }
                        else{
                            callback(error);
                        }
                    });
                }
                
                firstRead();
            },
            "finish": function(){}
        }
    },
    
    "Read Until":{
        topic:function(){
            
            var callback = this.callback;
            
            var source = new index.BufferReadStream(new Buffer("line 1\nline 2\n"));
            var reader = new index.ProactiveReadStream(source);
            
            function readFirstLine(){
                reader.read("\n", function(data, error){
                    if(data){
                        if(data.toString() == "line 1\n"){
                            readSecondLine();
                        }
                        else{
                            callback("first read returned wrong data");
                        }
                    }
                    else{
                        callback(error);
                    }
                });
            }
            
            function readSecondLine(){
                reader.read("\n", function(data, error){
                    if(data){
                        if(data.toString() == "line 2\n"){
                            callback();
                        }
                        else{
                            callback("second read returned wrong data");
                        }
                    }
                    else{
                        callback(error);
                    }
                });
            }
            
            readFirstLine();
        },
        "finish": function(){}
    },
    
    "Read soon as possible":{
        topic:function(){
            
            var callback = this.callback;
            
            var source = new index.BufferReadStream(new Buffer("jibberish"), {chunkSize:4});
            var reader = new index.ProactiveReadStream(source);
            
            function readFirstChunk(){
                reader.read(null, function(data, error){
                    if(data){
                        if(data == "jibb"){
                            readSecondChunk();
                        }
                        else{
                            callback("first read returned wrong data");
                        }
                    }
                    else{
                        callback(error);
                    }
                });
            }
            
            function readSecondChunk(){
                reader.read(null, function(data, error){
                    if(data){
                        if(data == "eris"){
                            readThirdChunk();
                        }
                        else{
                            callback("second read returned wrong data");
                        }
                    }
                    else{
                        callback(error);
                    }
                });
            }
            
            function readThirdChunk(){
                reader.read(null, function(data, error){
                    if(data){
                        if(data == "h"){
                            callback();
                        }
                        else{
                            callback("third read returned wrong data");
                        }
                    }
                    else{
                        callback(error);
                    }
                });
            }
            
            readFirstChunk();
        },
        "finish": function(){}
    }
    
})["export"](module);
