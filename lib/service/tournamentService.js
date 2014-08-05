'use strict';

var TournamentService = function(){}

TournamentService.prototype.saveTournament = function(req, res, model){
    model.signupID = req.body.tournamentName + '' + new Date().getTime();
    model.provider = 'local';
    model.save(function(err) {
        if (err) {
            return res.json(400, err);
        } else {
            return res.json({adminURL:model._id, signupURL:model.signupID});//req
        }
    });
}

module.exports.TournamentService = TournamentService;