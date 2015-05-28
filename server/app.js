/**
 * Main application file
 */



'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
// Setup server
var app = express();
var server = require('http').createServer(app);
var modifyable = require('./config.json');
var get = require('./lib/deployment')(modifyable);
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.get('/api/v1/getAllApps', get.allApps);
app.post('/api/v1/deployApp', get.deployment);
app.post('/api/v1/killApp', get.appTermination);

require('./config/express')(app);
require('./routes')(app);


// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
