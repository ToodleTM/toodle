'use strict';

var TournamentService = function(){};

TournamentService.prototype.enginesPath = '../gameRules/';

TournamentService.prototype.getTournamentEngine = function(tournamentEngineName){
    return new (require(this.enginesPath+tournamentEngineName).Engine)();
};

TournamentService.prototype.saveTournament = function(req, res, tournament){
    tournament.signupID = req.body.tournamentName + '' + new Date().getTime();
    tournament.provider = 'local';
    tournament.save(function(err) {
        if (err) {
            return res.json(400, err);
        } else {
            return res.json({adminURL:tournament._id, signupURL:tournament.signupID});//req
        }
    });
};

TournamentService.prototype.updateTournament = function(req, res, tournament){
    tournament.save(function(err) {
        if (err) {
            return res.json(400, err);
        } else {
            return res.json(tournament);
        }
    });
};

TournamentService.prototype.registerPlayer = function(req, res, tournament){
    function playerIsAlreadyRegistered() {
        var found = false;
        tournament.players.forEach(function(player){
            if(player.name.toLowerCase() == req.body.nick.toLowerCase()){
                found = true;
            }
        });
        return found;
    }

    if(playerIsAlreadyRegistered()){
        return res.json(400, {message:'noDuplicateNick'});
    } else if (tournament.locked){
        return res.json(400, {message:'registrationLocked'});
    } else if(req.body.nick.trim()) {
        tournament.players.push({name:req.body.nick});
        tournament.save(function(err){
            if(err){
                return res.json(500, {message:'saveError'});
            }
            return res.json(tournament);
        });
    } else {
        return res.json(400, {message:'noEmptyNick'});
    }
};

TournamentService.prototype.startTournament = function(req, res, tournament){
    var engine = this.getTournamentEngine(tournament.engine);
    var that = this;
    engine.initBracket(tournament.players, function(err, createdBracket){
        if(err){
            return res.json(500, err);
        } else {
            that.updateTournament(req, res, tournament, function(err, data){
                if(err){
                    return res.json(500, err);
                } else {
                    return res.json(createdBracket);
                }
            });
        }
    });
};

module.exports.TournamentService = TournamentService;