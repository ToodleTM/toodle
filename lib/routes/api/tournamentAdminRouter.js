'use strict';

var tournament = require('../../controllers/tournaments');
var express = require('express');
var router = express.Router();

router.patch('/update', function(req, res, next){tournament.update(req, res, next);});
router.patch('/lockTournament', function(req, res, next){tournament.lockTournament(req, res, next);});
router.patch('/unlockTournament', function(req, res, next){tournament.unlockTournament(req, res, next);});
router.post('/multipleRegistration', function(req, res, next){tournament.multipleRegistration(req, res, next);});
router.post('/removePlayer', function(req, res, next){tournament.removePlayer(req, res, next);});
router.post('/rearrangePlayers', function(req, res, next){tournament.rearrangePlayers(req, res, next);});
router.get('/:id', function(req, res, next){tournament.admin(req, res, next);});

module.exports = router;
