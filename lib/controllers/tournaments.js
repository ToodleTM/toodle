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

exports.admin = function(req, res, next){
    var adminPageId = req.params.id;

    Tournament.findById(adminPageId, function(err, tournamentData){
        if(err){
            return next(err);
        } else if(tournamentData){
            return res.send(tournamentData);
        }
        return res.send(404);
    });

};

exports.play = function(req, res, next){
    var playId = req.params.id;

    Tournament.find({signupID:playId}, function(err, tournamentData){
        if(err){
            return next(err);
        } else if(tournamentData){
            return res.send(tournamentData[0]);
        }
        return res.send(404);
    });

};