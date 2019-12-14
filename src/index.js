const debug =require('debug')('server:debug');
// import config from 'config';
// import express from 'express';
var config = require('config');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var socketio = require('socket.io')(http);
var path = require('path')

// app.use(express.static("src"));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/html/index.html')
});

socketio.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('chat-message', function(msg){
		console.log('message: ' + msg);
		socketio.emit('chat-message', msg);
	});
	socket.on('user-typing', function(username){
		console.log(username + " is typing");
		socketio.emit('user-typing', username);
	});
	socket.on('stop-typing', function(username){
		console.log(username + " stopped typing");
		socketio.emit('stop-typing', username);
	});
});

http.listen((process.env.PORT || config.get('port')), function(){
	debug(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
	console.log(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
});

module.exports= app;
module.exports.port=http.address().port;