'use strict';

var TournamentService = function(){};

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
};

TournamentService.prototype.updateTournament = function(req, res, model){
    model.save(function(err) {
        if (err) {
            return res.json(400, err);
        } else {
            return res.json(model);
        }
    });
};

TournamentService.prototype.registerPlayer = function(req, res, model){
    function playerIsAlreadyRegistered() {
        var found = false;
        model.players.forEach(function(player){
            if(player.name.toLowerCase() == req.body.nick.toLowerCase()){
                found = true;
            }
        });
        return found;
    }

    if(playerIsAlreadyRegistered()){
        return res.json(400, {message:'noDuplicateNick'});
    } else if (model.locked){
        return res.json(400, {message:'registrationLocked'});
    } else if(req.body.nick.trim()) {
        model.players.push({name:req.body.nick});
        model.save(function(err){
            if(err){
                return res.json(500, {message:'saveError'});
            }
            return res.json(model);
        });
    } else {
        return res.json(400, {message:'noEmptyNick'});
    }
};

module.exports.TournamentService = TournamentService;