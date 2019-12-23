const debug =require('debug')('server:debug');
// import config from 'config';
// import express from 'express';
var config = require('config');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path')

// require('./chat_sockets.js')(io);

var usernames = {};
var rooms = [];

function mapToArray(inputMap){
	var resultArray = [];
	for (var key in inputMap){
		resultArray.push(key);
		// console.log( key, inputMap[key] );
	}
	return resultArray;
}

function deleteEmptyRoom(io, socket){
	// If room is now empty, remove it
	if (io.sockets.adapter.rooms[socket.room] == undefined){
		console.log(socket.room + " is empty.");
		rooms.splice(rooms.indexOf(socket.room), 1);
		io.emit('update-room-list', rooms);
	}
}

io.on('connection', function(socket){
	require('./chat_sockets.js')(socket);
	require('./game_sockets.js')(socket);

	console.log('a user connected');
	socket.on('user-created', (username)=>{
		socket.username = username;
		usernames[username] = username;
		io.to(socket.id).emit('update-room-list', rooms);
		io.emit('update-user-list', mapToArray(usernames));
	});
	socket.on('room-created', (newRoom)=>{
		rooms.push(newRoom);
		io.emit('update-room-list', rooms);
		io.to(socket.id).emit('room-created', newRoom);
	});
	socket.on('disconnect', function(){
		// If someone hasn't chosen a name, disconnect message shouldn't be shown
		if (socket.username){
			io.emit('chat-message', {
				message: socket.username + " has disconnected.",
				user: "System"
			});
		}
		
		delete usernames[socket.username];
		io.emit('update-user-list', mapToArray(usernames));
		console.log('user disconnected');

		// If disconnected user was in a room, check to delete empty room
		if (socket.room){
			deleteEmptyRoom(io, socket);
		}
	});

	socket.on('join-room', (room)=>{
		if (socket.room){
			io.to(socket.room).emit('chat-message', {
				message: socket.username + " has left " + socket.room + ".",
				user: "System"
			});
			console.log(socket.username + " leaving " + socket.room);
			socket.leave(socket.room);

			// If room is now empty, delete it
			deleteEmptyRoom(io, socket);
		}
		socket.room = room;
		socket.join(room);
		io.to(room).emit('chat-message', {
			message: socket.username + " has joined " + room + ".",
			user: "System"
		});
		console.log(socket.username + " joining " + room);
	});
	socket.on('chat-message', function(msg){
		console.log('message: ' + msg);
		io.in(msg.room).emit('chat-message', msg);
	});

	return io;
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/html/index.html')
});

http.listen((process.env.PORT || config.get('port')), function(){
	debug(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
	console.log(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
});

module.exports= app;
module.exports.port=http.address().port;