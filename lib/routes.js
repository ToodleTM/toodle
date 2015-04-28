'use strict';

//var api = require('./controllers/api'),
var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    tournament = require('./controllers/tournaments'),
    middleware = require('./middleware'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    twitterConfig = require('./config/env/twitterConfig.js'),
    gplusConfig = require('./config/env/gplusConfig.js'),
    my = require('./controllers/my'),
    url = require('url'),
    crypto = require('crypto');


var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var GooglePlusStrategy = require('passport-google-plus');


passport.use(new GooglePlusStrategy({
    clientId:gplusConfig.clientID,
    apiKey:gplusConfig.apiKey,
    clientSecret:gplusConfig.apiKey,
    redirectUri:'http://localhost:9042/gplus_callback'
}, function(tokens, profile, done){
    done(null, profile);
}));

passport.use(new TwitterStrategy({
    consumerKey:twitterConfig.consumerKey,
    consumerSecret:twitterConfig.consumerSecret,
    callbackURL:twitterConfig.callbackURL
}, function(token, tokenSecret, profile, done){
    done(null, profile);
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (id, done) {
    User.findOne({
        socialId: id.id
    }, function (err, user) {
        var userInfo = user? user : {socialId:id.id};

        User.update({socialId:id.id}, {$set :{socialId:id.id}}, {upsert : true}, function(err){
            done(err, userInfo);
        });
    });
});

/**
 * Application routes
 */
module.exports = function (app) {
    app.get('/login', function(req, res, next){
        //console.log(req.session.passport);
        req.session.returnUrl = req.query.returnUrl;
        if(req.query.type === 'twitter') {
            next();
        } else {
            var state = crypto.createHash('sha256').update(''+req.session.id).digest('hex');
            res.redirect('https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.login&state='+state+'&redirect_uri=http://localhost:9042/gplus_callback&response_type=code&client_id=354676151765-58qne1rva936l6o0cp66u3scgaqrtc2m.apps.googleusercontent.com&access_type=offline');
        }
    }, passport.authenticate('twitter'), function(req, res, next){
        next();
    });

    //app.get('/login_gplus', function(req, res, next){
    //    req.session.returnUrl = req.query.returnUrl;
    //    var state = '11a3e229084349bc25d97e29393ced1d';
    //    res.redirect('https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.login&state='+state+'&redirect_uri=http://localhost:9042/gplus_callback&response_type=code&client_id=354676151765-58qne1rva936l6o0cp66u3scgaqrtc2m.apps.googleusercontent.com&access_type=offline');
    //});

    app.get('/twitter_callback', passport.authenticate('twitter', {successRedirect:'/success', failureRedirect:'/failure'}));

    app.get('/gplus_callback', function(req, res, next){
        var parsedUrl = url.parse(req.url, true);
        req.params['code'] = parsedUrl.query.code;
        next();
    }, passport.authenticate('google'),function(req, res) {
        // Return user profile back to client
        res.redirect('/success');
    });

    app.get('/success', function(req, res){
        res.redirect(req.session.returnUrl);
    });

    app.get('/get-session-data', function(req, res){
        if(req.session && req.session.passport && req.session.passport.user){
            res.json(req.session.passport.user);
        } else {
            res.json({});
        }
    });

    app.get('/failure', function(req, res){
        res.redirect(req.session.returnUrl);
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect(req.query.returnUrl);
    });

    app.get('/api/my/tournaments', function(req, res){
        my.getTournaments(req, res);
    });

    // Server API Routes
    app.route('/api/update-tournament/play')
        .put(tournament.updatePlayers);

    app.route('/api/users')
        .post(users.create)
        .put(users.changePassword);
    app.route('/api/users/me')
        .get(users.me);
    app.route('/api/users/:id')
        .get(users.show);

    app.route('/api/session')
        .post(session.login)
        .delete(session.logout);
    app.route('/api/tournament')
        .post(tournament.create);
    app.route('/api/tournament/start/')
        .put(tournament.start);
    app.route('/api/tournament/swapPlayers/')
        .post(tournament.swapPlayers);
    app.route('/api/tournament/stop/')
        .put(tournament.stop);
    app.route('/api/tournament/addPlayer/')
        .post(tournament.addPlayer);
    app.route('/api/tournament/matchesToReport')
        .get(tournament.matchesToReport);
    app.route('/api/tournament/reportMatch')
        .post(tournament.reportMatch);
    app.route('/api/tournament/matchesToUnreport')
        .get(tournament.matchesToUnreport);
    app.route('/api/tournament/unreportMatch')
        .post(tournament.unreportMatch);
    app.route('/api/tournament/admin/update')
        .put(tournament.update);
    app.route('/api/tournament/admin/lockTournament')
        .put(tournament.lockTournament);
    app.route('/api/tournament/admin/unlockTournament')
        .put(tournament.unlockTournament);
    app.route('/api/tournament/admin/multipleRegistration')
        .post(tournament.multipleRegistration);
    app.route('/api/tournament/admin/removePlayer')
        .post(tournament.removePlayer);
    app.route('/api/tournament/admin/rearrangePlayers')
        .post(tournament.rearrangePlayers);
    app.route('/api/tournament/admin/:id')
        .get(tournament.admin);
    app.route('/api/play/:id')
        .get(tournament.play);

    app.route('/api/tournament/winners/csv')
        .get(tournament.exportTournamentWinners);
    // All undefined api routes should return a 404
    app.route('/api/*')
        .get(function (req, res) {
            res.send(404);
        });

    // All other routes to use Angular routing in app/scripts/app.js
    app.route('/partials/*')
        .get(index.partials);
    app.route('/*')
        .get(middleware.setUserCookie, index.index);
};