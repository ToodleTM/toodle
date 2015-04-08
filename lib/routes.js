'use strict';

//var api = require('./controllers/api'),
var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    tournament = require('./controllers/tournaments'),
    middleware = require('./middleware'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    twitterConfig = require('./config/env/twitterConfig.js');

var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

//TODO: il faudra passer les clef / secret dans une var d'env ou un fichier de conf à part
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
        socialId: id
    }, function (err, user) {
        var userInfo = user? user : {socialId:id};

        User.update({socialId:id}, {$set :{socialId:id}}, {upsert : true}, function(err){
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
        next();
    }, passport.authenticate('twitter'), function(req, res, next){
        next();
    });

    app.get('/twitter_callback', passport.authenticate('twitter', {successRedirect:'/success', failureRedirect:'/failure'}));

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
        delete req.session.passport.user;
        req.session.returnUrl = req.query.returnUrl;
        res.redirect(req.session.returnUrl);
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