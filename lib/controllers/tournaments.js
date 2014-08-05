'use strict';


var mongoose = require('mongoose'),
    Tournament = mongoose.model('Tournament'),
    passport = require('passport'),
    TournamentService = require('../service/tournamentService.js').TournamentService;

exports.create = function(req, res, next) {
    var newTournament = new Tournament(req.body);
    var tournamentService = new TournamentService();
    tournamentService.saveTournament(req, res, newTournament);
};