'use strict';

var tournament = require('../../controllers/tournaments');
var express = require('express');
var router = express.Router();

router.patch('/start', function (req, res, next) {tournament.start(req, res, next);});
router.patch('/stop', function (req, res, next) {tournament.stop(req, res, next);});
router.post('/addPlayer', function (req, res, next) {tournament.addPlayer(req, res, next);});
router.post('/reportMatch', function (req, res, next) {tournament.reportMatch(req, res, next);});
router.post('/unreportMatch', function (req, res, next) {tournament.unreportMatch(req, res, next);});
router.post('/forfeitMatch', function (req, res, next) {tournament.forfeitMatch(req, res, next);});
router.post('/swapPlayers', function (req, res, next) {tournament.swapPlayers(req, res, next);});
router.get('/matchesToReport', function (req, res, next) {tournament.matchesToReport(req, res, next);});
router.get('/matchesToUnreport', function (req, res, next) {tournament.matchesToUnreport(req, res, next);});
router.get('/winners/csv', function (req, res, next) {tournament.exportTournamentWinners(req, res, next);});
router.post('/genBracketForTournament/', function (req, res, next) {tournament.genBracketForTournament(req, res, next);});
router.post('/updateBracketDataAndStart/', function (req, res, next) {tournament.updateBracketDataAndStart(req, res, next);});
router.post('/', function (req, res, next) {tournament.create(req, res, next);});

module.exports = router;
