'use strict';
var _ = require('lodash');

var TournamentService = function () {
};

TournamentService.prototype.enginesPath = '../gameRules/';

TournamentService.prototype.getTournamentEngine = function (tournamentEngineName) {
    return new (require(this.enginesPath + tournamentEngineName).Engine)();
};

TournamentService.prototype.saveTournament = function (req, res, tournament) {
    tournament.signupID = req.body.tournamentName + '' + new Date().getTime();
    tournament.provider = 'local';
    tournament.save(function (err) {
        if (err) {
            return res.json(400, err);
        } else {
            return res.json({adminURL: tournament._id, signupURL: tournament.signupID});//req
        }
    });
};

TournamentService.prototype.updateTournament = function (req, res, tournament) {
    tournament.save(function (err) {
        if (err) {
            return res.json(400, err);
        } else {
            return res.json(tournament);
        }
    });
};


TournamentService.prototype.registerPlayer = function (req, res, tournament, lockingOverride) {
    function playerIsAlreadyRegistered() {
        var found = _.find(tournament.players, function(player){
            return player.name.toLowerCase() == req.body.nick.toLowerCase();
        });
        return found;
    }
    if(tournament.running){
        return res.json(409, {message:'tournamentAlreadyRunning'});
    }
    else if (playerIsAlreadyRegistered()) {
        return res.json(400, {message: 'noDuplicateNick'});
    } else if (tournament.locked && !lockingOverride) {
        return res.json(400, {message: 'registrationLocked'});
    } else if (req.body.nick.trim()) {
        tournament.players.push({name: req.body.nick});
        tournament.save(function (err) {
            if (err) {
                return res.json(500, {message: 'saveError'});
            }
            return res.json(tournament);
        });
    } else {
        return res.json(400, {message: 'noEmptyNick'});
    }
};

TournamentService.prototype.startTournament = function (req, res, tournament) {
    if (!tournament.running) {
        if (tournament.players && tournament.players.length) {
            if (tournament.engine) {
                var engine = this.getTournamentEngine(tournament.engine);
                var that = this;
                engine.initBracket(tournament.players, function (err, createdBracket) {
                    if (err) {
                        return res.json(500, err);
                    } else {
                        tournament.bracket = createdBracket;
                        tournament.running = true;
                        tournament.locked = true;
                        that.updateTournament(req, res, tournament, function (err, data) {
                            if (err) {
                                return res.json(500, err);
                            } else {
                                return res.json(data);
                            }
                        });
                    }
                });
            } else {
                res.json(409, {message: 'noEngineSpecified'});
            }
        } else {
            res.json(409, {message: 'noPlayers'});
        }
    } else {
        return res.json(409, {message: 'tournamentAlreadyRunning'});
    }
};

TournamentService.prototype.stopTournament = function (req, res, tournament) {
    if (tournament.running) {
        tournament.bracket = {};
        tournament.running = false;

        this.updateTournament(req, res, tournament, function (err, data) {
            if (err) {
                return res.json(500, err);
            } else {
                return res.json(tournament);
            }
        });
    } else {
        res.json(409, {message: 'tournamentAlreadyStopped'});
    }
};

TournamentService.prototype.getMatchesToReport = function(req, res, tournament){
    var engine = this.getTournamentEngine(tournament.engine);
    try{
        engine.getMatchesToReport(tournament.bracket, function(err, data){
            if(err){
                return res.json(500, 'errorFindingMatchesToReport');
            } else {
                return res.json(data);
            }
        });
    } catch (exception){
        return res.json(500, 'errorFindingMatchesToReport');
    }
};

module.exports.TournamentService = TournamentService;