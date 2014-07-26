'use strict';

var mongoose = require('mongoose'),
    Tournament = mongoose.model('Tournament'),
    passport = require('passport');

exports.create = function(req, res, next) {
    var newTournament = new Tournament(req.body);
    newTournament.signupID = req.body.tournamentName + '' + new Date().getTime();
    newTournament.provider = 'local';
    newTournament.save(function(err) {
        if (err) {
            return res.json(400, err);
        } else {
            return res.json({adminURL:newTournament._id, signupURL:newTournament.signupID});//req
        }
    });
};
