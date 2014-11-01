'use strict';
var _ = require('lodash');

var TournamentService = function () {
};

var SERVER_APP_ERROR = 409;

TournamentService.prototype.enginesPath = '../gameRules/';

TournamentService.prototype.getTournamentEngine = function (tournamentEngineName) {
    var engine = null;
    try {
        engine = new (require(this.enginesPath + tournamentEngineName).Engine)()
    } catch (exception) {
        console.error('Tried to require an invalid engine !');
    }
    return engine;
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
        var found = _.find(tournament.players, function (player) {
            return player.name.toLowerCase() == req.body.nick.toLowerCase();
        });
        return found;
    }

    if (tournament.running) {
        return res.json(SERVER_APP_ERROR, {message: 'tournamentAlreadyRunning'});
    }
    else if (playerIsAlreadyRegistered()) {
        return res.json(400, {message: 'noDuplicateNick'});
    } else if (tournament.locked && !lockingOverride) {
        return res.json(400, {message: 'registrationLocked'});
    } else if (req.body.nick.trim()) {
        tournament.players.push({name: req.body.nick, faction: req.body.faction});
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

TournamentService.prototype.unregisterPlayer = function (req, res, tournament) {
    if (tournament.running) {
        return res.json(409, {message:'cantRemovePlayerWhileRunning'});
    } else {
        var filteredPlayers = _.filter(tournament.players, function (player) {
            return player.name != req.body.nick.trim();
        });
        tournament.players = filteredPlayers;
        tournament.save(function (err) {
            if (err) {
                return res.json(500, {message: 'saveError'});
            }
            return res.json(tournament);
        });
    }
};

TournamentService.prototype.startTournament = function (req, res, tournament) {
    if (!tournament.running) {
        if (tournament.players && tournament.players.length) {
            if (tournament.engine) {
                var engine = this.getTournamentEngine(tournament.engine);
                var that = this;
                if (engine) {
                    engine.initBracket(tournament.players, function (err, createdBracket) {
                        if (err) {
                            return res.json(SERVER_APP_ERROR, err);
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
                    res.json(SERVER_APP_ERROR, {message: 'invalidTournamentEngine'})
                }
            } else {
                res.json(SERVER_APP_ERROR, {message: 'noEngineSpecified'});
            }
        } else {
            res.json(SERVER_APP_ERROR, {message: 'noPlayers'});
        }
    } else {
        return res.json(SERVER_APP_ERROR, {message: 'tournamentAlreadyRunning'});
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
        res.json(SERVER_APP_ERROR, {message: 'tournamentAlreadyStopped'});
    }
};

TournamentService.prototype.getMatchesToReport = function (req, res, tournament) {
    if (tournament.engine) {
        var engine = this.getTournamentEngine(tournament.engine);
        try {
            engine.getMatchesToReport(tournament.bracket, function (err, data) {
                if (err) {
                    return res.json(SERVER_APP_ERROR, 'errorFindingMatchesToReport');
                } else {
                    return res.json(data);
                }
            });
        } catch (exception) {
            return res.json(500, 'errorFindingMatchesToReport');
        }
    } else {
        return res.json([]);
    }
};

TournamentService.prototype.reportMatch = function (req, res, tournament, TournamentModel) {
    var engine = this.getTournamentEngine(tournament.engine);
    try {
        engine.reportWin(req.body.number, req.body.score1, req.body.score2, tournament.bracket, function (err, data) {
            if (err) {
                return res.json(SERVER_APP_ERROR, {error: 'errorReportingMatch', message: err.message});
            } else {
                tournament.bracket = data;

                TournamentModel.update({_id: tournament._id}, {bracket: data}, function (err) {
                    if (err) {
                        return res.json(500, {error: 'errorReportingMatch', message: 'Tournament update failed!'});
                    } else {
                        return res.json(tournament);
                    }
                });
            }
        });
    } catch (exception) {
        return res.json(500, 'errorReportingMatch');
    }
};

TournamentService.prototype.getMatchesToUnreport = function (req, res, tournament) {
    if (tournament.engine) {
        var engine = this.getTournamentEngine(tournament.engine);
        try {
            engine.getUnreportableMatches(tournament.bracket, function (err, data) {
                if (err) {
                    return res.json(SERVER_APP_ERROR, 'errorFindingMatchesToUnreport');
                } else {
                    return res.json(data);
                }
            });
        } catch (exception) {
            return res.json(500, 'errorFindingMatchesToUnreport');
        }
    } else {
        return res.json([]);
    }
};

TournamentService.prototype.unreportMatch = function (req, res, tournament, TournamentModel) {
    var engine = this.getTournamentEngine(tournament.engine);
    try {
        engine.unreport(req.body.number, tournament.bracket, function (err, data) {
            if (err) {
                return res.json(SERVER_APP_ERROR, {error: 'errorUnreportingMatch', message: err.message});
            } else {
                tournament.bracket = data;

                TournamentModel.update({_id: tournament._id}, {bracket: data}, function (err) {
                    if (err) {
                        return res.json(500, {error: 'errorUnreportingMatch', message: 'Tournament update failed!'});
                    } else {
                        return res.json(tournament);
                    }
                });
            }
        });
    } catch (exception) {
        return res.json(500, 'errorUnreportingMatch');
    }
};

TournamentService.prototype.unlockTournament = function (req, res, tournament, TournamentModel) {
    if (tournament.running) {
        res.json(SERVER_APP_ERROR, {message: 'cantUnlockRunningTournament'});
    } else {
        TournamentModel.update({_id: tournament._id}, {locked: false}, function (err) {
            if (err) {
                return res.json(500, {message: 'errorSavingTournamentData'});
            } else {
                return res.json(tournament);
            }
        });
    }
};

TournamentService.prototype.lockTournament = function (req, res, tournament, TournamentModel) {
    TournamentModel.update({_id: tournament._id}, {locked: true}, function (err) {
        if (err) {
            return res.json(500, {message: 'errorSavingTournamentData'});
        } else {
            return res.json(tournament);
        }
    });
};

TournamentService.prototype.multipleSeed = function (req, res, tournament, playersToAdd) {
    var uniquePlayersToAdd = _.uniq(playersToAdd, function (player) {
        return player.name.toLowerCase().trim()
    });
    var alreadyEnlistedPlayers = _.forEach(tournament.players, function (player) {
        return {name: player.name.toLowerCase().trim()}
    });

    _.forEach(uniquePlayersToAdd, function (playerToAdd) {
        if (alreadyEnlistedPlayers.length == 0 || !_.find(alreadyEnlistedPlayers, function (item) {
                return item.name.toLowerCase() == playerToAdd.name.toLowerCase().trim()
            })) {
            var playerToPush = {name: playerToAdd.name.trim()};
            if (playerToAdd.faction) {
                playerToPush.faction = playerToAdd.faction.trim();
            }
            tournament.players.push(playerToPush);
        }
    });

    return res.json(tournament);
};

module.exports.TournamentService = TournamentService;