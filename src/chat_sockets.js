
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

module.exports = function(io){
	io.on('connection', function(socket){
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
		socket.on('chat-message', function(msg){
			console.log('message: ' + msg);
			io.to(msg.room).emit('chat-message', msg);
		});
		socket.on('user-typing', function(userTyping){
			console.log(userTyping.user + " is typing");
			socket.to(userTyping.room).emit('user-typing', userTyping.user);
		});
		socket.on('stop-typing', function(stopTyping){
			console.log(stopTyping.user + " stopped typing");
			socket.to(stopTyping.room).emit('stop-typing', stopTyping.user);
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
		})
	});
};
