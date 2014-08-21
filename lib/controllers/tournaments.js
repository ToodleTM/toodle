'use strict';


var mongoose = require('mongoose'),
    Tournament = mongoose.model('Tournament'),
    passport = require('passport'),
    TournamentService = require('../service/tournamentService.js').TournamentService;

exports.create = function (req, res) {
    var newTournament = new Tournament(req.body);
    var tournamentService = new TournamentService();
    tournamentService.saveTournament(req, res, newTournament);
};

exports.update = function (req, res, next) {
    var tournament = req.body;
    var tournamentService = new TournamentService();
    var model = req.body;
    Tournament.findById(model._id, function (err, tournamentData) {
        if (err) {
            return next(err);
        } else {
            Object.keys(tournament).forEach(function(key){
                tournamentData[key] = tournament[key];
            });
            return tournamentService.updateTournament(req, res, tournamentData);
        }
    });
};

exports.admin = function (req, res, next) {
    var adminPageId = req.params.id;

    Tournament.findById(adminPageId, function (err, tournamentData) {
        if (err) {
            return next(err);
        } else if (tournamentData) {
            return res.send(tournamentData);
        } else {
            return res.send(404);
        }
    });

};

exports.play = function (req, res, next) {
    var playId = req.params.id;

    Tournament.find({signupID: playId}, function (err, tournamentData) {
        if (err) {
            return next(err);
        } else if (tournamentData) {
            return res.send(tournamentData[0]);
        } else {
            return res.send(404);
        }
    });

};

exports.updatePlayers = function (req, res) {
    var tournamentService = new TournamentService();
    Tournament.findById(req.body.tournamentId, function (err, data) {
        if (err) {
            return res.json(404);
        } else {
            return tournamentService.registerPlayer(req, res, data);
        }
    });
};

exports.start = function (req, res) {
    var tournamentService = new TournamentService();
    Tournament.findById(req.body.tournamentId, function (err, data) {
        if (err) {
            return res.json(404);
        } else {
            return tournamentService.startTournament(req, res, data);
        }
    });
};

exports.stop = function (req, res) {
    var tournamentService = new TournamentService();
    Tournament.findById(req.body.tournamentId, function (err, data) {
        if (err) {
            return res.json(404);
        } else {
            return tournamentService.stopTournament(req, res, data);
        }
    });
};

exports.addPlayer = function (req, res) {
    var tournamentService = new TournamentService();
    Tournament.findById(req.body.tournamentId, function (err, data) {
        if (err) {
            return res.json(404);
        } else {
            return tournamentService.registerPlayer(req, res, data, true);
        }
    });
};