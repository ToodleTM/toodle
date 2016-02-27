'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    oauth2Server = require('oauth2-server'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    passport = require('passport'),
    mongoStore = require('connect-mongo')(session);

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');
var db = null;
if (process.env.NODE_ENV !== 'maintenance') {
    db = mongoose.connect(config.mongo.uri, config.mongo.options);
}
// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
    if (/(.*)\.(js$)/.test(file)) {
        require(modelsPath + '/' + file);
    }
});
modelsPath += '/oauth';
fs.readdirSync(modelsPath).forEach(function (file) {
    if (/(.*)\.(js$)/.test(file)) {
        require(modelsPath + '/' + file);
    }
});

// Setup Express
var app = express();
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
    secret: 'to be parametrized',
    store: new mongoStore({
        url: config.mongo.uri,
        collection: 'sessions'
    }, function () {
        console.log('initialized session');
    })
}));


// Use passport session
app.use(passport.initialize());
app.use(passport.session());

app.oauth = oauth2Server({
    model: new (require('./lib/oauth/oauthServer'))(),
    grants: ['authorization_code'],
    debug: true
});

function check(req, callback) {
    if (!req.session.userData) {
        req.session.originalQuery = req.query;
        req.res.render('login');
    } else {
        callback(null, true, req.session.userData);
    }
}

app.all('/oauth/auth-code-grant', app.oauth.authCodeGrant(check));

app.post('/login-user', function (req, res) {
    var User = mongoose.model('User');
    var passwordHash = crypto.createHmac('sha256', req.body.password).digest('hex');
    User.findOne({name: req.body.username, password: passwordHash}, function (err, userData) {
        if (err) {
            res.redirect('/oauth/failed-login');
        } else {
            if (userData) {
                delete userData._doc.password;
                userData._doc.id = userData._doc._id;
                req.session.userData = userData._doc;
            }
            res.redirect('/oauth/auth-code-grant?response_type=code&redirect_uri=' + req.session.originalQuery.redirect_uri + '&client_id=' + req.session.originalQuery.client_id);
        }
    });
});

app.all('/oauth/token', app.oauth.grant());


app.get('/oauth/authorize', app.oauth.authorise(), function (req, res) {
    res.send('Secret area');
});

app.use(app.oauth.errorHandler());

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
