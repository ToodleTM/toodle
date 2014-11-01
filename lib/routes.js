'use strict';

//var api = require('./controllers/api'),
var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session'),
    tournament = require('./controllers/tournaments'),
    middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function (app) {


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
    app.route('/api/tournament/admin/:id')
        .get(tournament.admin);
    app.route('/api/play/:id')
        .get(tournament.play);

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