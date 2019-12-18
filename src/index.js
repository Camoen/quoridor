const debug =require('debug')('server:debug');
// import config from 'config';
// import express from 'express';
var config = require('config');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path')

require('./chat_sockets.js')(io);

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