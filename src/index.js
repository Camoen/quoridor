const debug =require('debug')('server:debug');
// import config from 'config';
// import express from 'express';
var config = require('config');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var socketio = require('socket.io')(http);
var path = require('path')

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/html/index.html')
});

var usernames = {};
var rooms = ["Room 1", "Room 2", "Room 3"];
function mapToArray(inputMap){
	var resultArray = [];
	for (var key in inputMap){
		resultArray.push(key);
		// console.log( key, inputMap[key] );
	}
	return resultArray;
}

socketio.on('connection', function(socket){
	console.log('a user connected');
	socket.on('user-created', (username)=>{
		socket.username = username;
		usernames[username] = username;
		socketio.to(socket.id).emit('update-room-list', rooms);
		socketio.emit('update-user-list', mapToArray(usernames));
	});
	socket.on('disconnect', function(){
		socketio.emit('chat-message', {
			message: socket.username + " has disconnected.",
			user: "System"
		});
		delete usernames[socket.username];
		socketio.emit('update-user-list', mapToArray(usernames));
		console.log('user disconnected');
	});
	socket.on('chat-message', function(msg){
		console.log('message: ' + msg);
		socketio.to(msg.room).emit('chat-message', msg);
	});
	socket.on('user-typing', function(userTyping){
		console.log(userTyping.user + " is typing");
		socketio.to(userTyping.room).emit('user-typing', userTyping.user);
	});
	socket.on('stop-typing', function(stopTyping){
		console.log(stopTyping.user + " stopped typing");
		socketio.to(stopTyping.room).emit('stop-typing', stopTyping.user);
	});
	socket.on('join-room', (room)=>{
		if (socket.room){
			console.log(socket.username + " leaving " + socket.room);
			socket.leave(socket.room);
		}
		socket.room = room;
		socket.join(room);
		console.log(socket.username + " joining " + room);
	})
});

http.listen((process.env.PORT || config.get('port')), function(){
	debug(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
	console.log(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
});

module.exports= app;
module.exports.port=http.address().port;