module.exports = function(socket){
	socket.on('square-filled', function(data){
		console.log('square-filled: ' + data + " " + socket.room);
		socket.to(socket.room).emit('square-filled', data);
	});
};
