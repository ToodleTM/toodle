'use strict';

var tournament = require('../../controllers/tournaments');
var express = require('express');
var router = express.Router();

router.patch('/start', tournament.start);
router.patch('/stop', tournament.stop);
router.post('/addPlayer', tournament.addPlayer);
router.post('/reportMatch', tournament.reportMatch);
router.post('/unreportMatch', tournament.unreportMatch);
router.post('/forfeitMatch', tournament.forfeitMatch);
router.post('/swapPlayers', tournament.swapPlayers);
router.get('/matchesToReport', tournament.matchesToReport);
router.get('/matchesToUnreport', tournament.matchesToUnreport);
router.get('/winners/csv', tournament.exportTournamentWinners);
router.post('/genBracketForTournament/', tournament.genBracketForTournament);
router.post('/updateBracketDataAndStart/', tournament.updateBracketDataAndStart);
router.post('/', tournament.create);

module.exports = router;
