'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');
var db = null;
if(process.env.NODE_ENV !== 'maintenance'){
    db = mongoose.connect(config.mongo.uri, config.mongo.options);
}
// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
    if (/(.*)\.(js$|coffee$)/.test(file)) {
        require(modelsPath + '/' + file);
    }
});

// Setup Express
var app = express();
require('./lib/config/express')(app);
app.use('/api/tournament/admin/', require('./lib/routes/api/tournamentAdminRouter.js'));
app.use('/api/tournament/', require('./lib/routes/api/tournamentRouter.js'));
app.use('/api/tournament-list', require('./lib/routes/api/tournamentListRouter.js'));
app.use('/api/', require('./lib/routes/api/miscRouter.js'));
app.use('/', require('./lib/routes/socialLogin/socialRouter.js'));

// Start server
app.listen(config.port, config.ip, function () {
    console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
