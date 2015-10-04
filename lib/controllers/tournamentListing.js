'use strict';

var mongoose = require('mongoose');
var Tournament;
var RESULTS_PER_PAGE = 20;

var TournamentListingController = function(){};

TournamentListingController.prototype.tournamentModel = function(){
    Tournament = mongoose.model('Tournament');
    return Tournament;
};

TournamentListingController.prototype.listTournaments = function(req, res){
    this.tournamentModel().find({}, {}, {
        skip: RESULTS_PER_PAGE * (req.query.pageNumber - 1),
        limit: RESULTS_PER_PAGE,
        sort:{creationTimestamp:-1}
    }, function (err, tournaments) {
        if(!err){
        res.json(tournaments);
        } else {
            res.status(500).json({message:'lookupError'});
        }
    });
};

TournamentListingController.prototype.countTournaments = function (req, res) {
    this.tournamentModel().count({}, function (err, data) {
        res.json(data);
    });
};

module.exports.TournamentListingController = TournamentListingController;

