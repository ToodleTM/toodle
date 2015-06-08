'use strict';

var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    tournament = require('./controllers/tournaments'),
    middleware = require('./middleware'),
    my = require('./controllers/my'),
    engine = require('./controllers/engineFinder.js'),
    loginController = require('./controllers/login');
var passport = require('passport');

module.exports = function (app) {
    app.get('/login', loginController.initLoginFlow, passport.authenticate('twitter'), function(req, res, next){
        next();
    });

    app.get('/twitter_callback', passport.authenticate('twitter', {successRedirect:'/success', failureRedirect:'/failure'}));

    app.get('/gplus_callback', loginController.gplusGetAuthzCode, passport.authenticate('google'), function(req, res) {
        res.redirect('/success');
    });

    app.get('/success', loginController.success);

    app.get('/get-session-data', loginController.sessionData);

    app.get('/failure', loginController.fail);

    app.get('/logout', loginController.logout);

    // Server API Routes
    app.get('/api/my/tournaments', function(req, res){
        my.getTournaments(req, res);
    });
    app.route('/api/update-tournament/play')
        .patch(tournament.updatePlayers);
    app.route('/api/users')
        .post(users.create)
        .patch(users.changePassword);
    app.route('/api/users/me')
        .get(users.me);
    app.route('/api/users/:id')
        .get(users.show);

    app.route('/api/available-engines')
        .get(engine.lookup);
    app.route('/api/tournament/genBracketForTournament/')
        .post(tournament.genBracketForTournament);

    app.route('/api/session')
        .post(session.login)
        .delete(session.logout);
    app.route('/api/tournament')
        .post(tournament.create);
    app.route('/api/tournament/start/')
        .patch(tournament.start);
    app.route('/api/tournament/swapPlayers/')
        .post(tournament.swapPlayers);

    app.route('/api/tournament/stop/')
        .patch(tournament.stop);
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
        .patch(tournament.update);
    app.route('/api/tournament/admin/lockTournament')
        .patch(tournament.lockTournament);
    app.route('/api/tournament/admin/unlockTournament')
        .patch(tournament.unlockTournament);
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
        .all(function (req, res) {
            res.send(404);
        });

    // All other routes to use Angular routing in app/scripts/app.js
    app.route('/partials/*')
        .get(index.partials);
    app.route('/*')
        .get(middleware.setUserCookie, index.index);
};