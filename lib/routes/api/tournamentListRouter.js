'use strict';
var express = require('express');
var TournamentListingController = require('../../controllers/tournamentListing').TournamentListingController;
var router = express.Router();

var controller = new TournamentListingController();
router.get('/list', function(req, res){controller.listTournaments(req, res);});

router.get('/count', function (req, res) {controller.countTournaments(req, res);});

module.exports = router;