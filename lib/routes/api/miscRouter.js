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
router.patch('/update-tournament/play', function(req, res, next){tournament.updatePlayers(req, res, next);});
router.get('/play/:id', function(req, res, next){tournament.play(req, res, next);});

router.get('/available-engines', engine.lookup);

router.post('/session', session.login);
router.delete('/session', session.logout);

// All undefined api routes should return a 404
router.all('/*', function (req, res) {
    res.send(404);
});

module.exports = router;