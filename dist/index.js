const debug = require('debug')('server:debug');
// import config from 'config';
// import express from 'express';
var config = require('config');
var express = require('express');

const app = express();

const listen = app.listen(config.get('port'), () => {
  debug(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
  console.log(`server is running on port ${config.get('port')} and in ${config.get('name')} mode`);
});

module.exports = app;
module.exports.port = listen.address().port;
//# sourceMappingURL=index.js.map