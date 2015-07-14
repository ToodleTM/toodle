'use strict';
var my = require('../../controllers/my'),
    tournament = require('../../controllers/tournaments'),
    session = require('../../controllers/session'),
    engine = require('../../controllers/engineFinder.js');
var express = require('express');
var router = express.Router();



router.get('/my/tournaments', function (req, res) {
    my.getTournaments(req, res);
});
router.patch('/update-tournament/play', tournament.updatePlayers);
router.get('/play/:id', tournament.play);

router.get('/available-engines', engine.lookup);

router.post('/session', session.login);
router.delete('/session', session.logout);
router.post('/tournament', tournament.create);

// All undefined api routes should return a 404
router.all('/*', function (req, res) {
    res.send(404);
});

module.exports = router;