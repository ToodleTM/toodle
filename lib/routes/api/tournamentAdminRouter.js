'use strict';

var tournament = require('../../controllers/tournaments');
var express = require('express');
var router = express.Router();

router.patch('/update', tournament.update);
router.patch('/lockTournament', tournament.lockTournament);
router.patch('/unlockTournament', tournament.unlockTournament);
router.post('/multipleRegistration', tournament.multipleRegistration);
router.post('/removePlayer', tournament.removePlayer);
router.post('/rearrangePlayers', tournament.rearrangePlayers);
router.get('/:id', tournament.admin);

module.exports = router;
