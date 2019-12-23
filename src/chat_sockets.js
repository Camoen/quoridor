
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

module.exports = function(socket){
	// Can change to a broadcast if message is shown instantly on sender's client
		// socket.on('chat-message', function(msg){
		// 	console.log('message: ' + msg);
		// 	socket.to(msg.room).emit('chat-message', msg);
		// });
		socket.on('user-typing', function(userTyping){
			console.log(userTyping.user + " is typing");
			socket.to(userTyping.room).emit('user-typing', userTyping.user);
		});
		socket.on('stop-typing', function(stopTyping){
			console.log(stopTyping.user + " stopped typing");
			socket.to(stopTyping.room).emit('stop-typing', stopTyping.user);
		});	
};
