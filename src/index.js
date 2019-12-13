const debug =require('debug')('server:debug');
// import config from 'config';
// import express from 'express';
var config = require('config');
// var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var socketio = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/html/index.html')
});

socketio.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat message', function(msg){
		console.log('message: ' + msg);
		socketio.emit('chat message', msg);
	});
});

http.listen(config.get('port'), function(){
	debug(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
	console.log(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
});


// const app=express();

// const listen = app.listen(config.get('port'),()=>{
// 	debug(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
//     console.log(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
// })

module.exports= app;
module.exports.port=http.address().port;