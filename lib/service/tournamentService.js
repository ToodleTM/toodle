'use strict';
var _ = require('lodash');
var _utils = new (require('../utils/serverUtils'))();

var TournamentService = function () {
};

var SERVER_APP_ERROR = 409;
var SYSTEM_ERROR = 500;

TournamentService.prototype.enginesPath = '../gameRules/';

TournamentService.prototype.utils = function () {
    return _utils;
};

TournamentService.prototype.getTournamentEngine = function (tournamentEngineName) {
    var engine = null;
    try {
        engine = new (require(this.enginesPath + tournamentEngineName).Engine)();
    } catch (exception) {
        console.error('Tried to require an invalid engine !');
    }
    return engine;
};

TournamentService.prototype.saveTournament = function (req, res, tournament, tournamentUser) {
    tournament.signupID = this.utils().createTournamentId(new Date().getTime(), req.body.tournamentName);
    tournament.provider = 'local';
    tournament.engine = 'singleElim';
    tournament.save(function (err) {
        if (err) {
            return res.json(400, err);
        } else {
            if (req.session && req.session.passport && req.session.passport.user) {
                tournamentUser.tournamentId = tournament._id;
                tournamentUser.socialId = req.session.passport.user.id;
                tournamentUser.creator = true;
                tournamentUser.admin = true;
                tournamentUser.name = req.body.tournamentName;

                tournamentUser.save(function () {
                    return res.json({adminURL: tournament._id, signupURL: tournament.signupID});
                });
            } else {
                return res.json({adminURL: tournament._id, signupURL: tournament.signupID});
            }
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
            return player.name.toLowerCase() === req.body.nick.toLowerCase();
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
                return res.json(SYSTEM_ERROR, {message: 'saveError'});
            }
            return res.json(tournament);
        });
    } else {
        return res.json(400, {message: 'noEmptyNick'});
    }
};

TournamentService.prototype.unregisterPlayer = function (req, res, tournament) {
    if (tournament.running) {
        return res.json(SERVER_APP_ERROR, {message: 'cantRemovePlayerWhileRunning'});
    } else {
        var filteredPlayers = _.filter(tournament.players, function (player) {
            return player.name !== req.body.nick.trim();
        });
        tournament.players = filteredPlayers;
        tournament.save(function (err) {
            if (err) {
                return res.json(SYSTEM_ERROR, {message: 'saveError'});
            }
            return res.json(tournament);
        });
    }
};

TournamentService.prototype.startTournament = function (req, res, tournament) {
    if (!tournament.running) {
        if (tournament.players && tournament.players.length) {
            if (tournament.engine && tournament.engine !== 'none') {
                if (tournament.userPrivileges) {
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
                                        return res.json(SYSTEM_ERROR, err);
                                    } else {
                                        return res.json(data);
                                    }
                                });
                            }
                        });
                    } else {
                        return res.json(SERVER_APP_ERROR, {message: 'invalidTournamentEngine'});
                    }
                } else {
                    return res.json(SERVER_APP_ERROR, {message: 'userPrivilegesMustBeSpecified'});
                }
            } else {
                return res.json(SERVER_APP_ERROR, {message: 'noEngineSpecified'});
            }
        } else {
            return res.json(SERVER_APP_ERROR, {message: 'noPlayers'});
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
                return res.json(SYSTEM_ERROR, err);
            } else {
                return res.json(data);
            }
        });
    } else {
        return res.json(SERVER_APP_ERROR, {message: 'tournamentAlreadyStopped'});
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
            return res.json(SYSTEM_ERROR, 'errorFindingMatchesToReport');
        }
    } else {
        return res.json([]);
    }
};

TournamentService.prototype.reportMatch = function (req, res, tournament, TournamentModel) {
    var engine = this.getTournamentEngine(tournament.engine);
    if (tournament.running) {
        try {
            engine.reportWin(req.body.number, req.body.score1, req.body.score2, tournament.bracket, function (err, data) {
                if (err) {
                    return res.json(SERVER_APP_ERROR, {error: 'errorReportingMatch', message: err.message});
                } else {
                    tournament.bracket = data;

                    TournamentModel.update({_id: tournament._id}, {bracket: data}, function (err) {
                        if (err) {
                            return res.json(SYSTEM_ERROR, {
                                error: 'errorReportingMatch',
                                message: 'Tournament update failed!'
                            });
                        } else {
                            return res.json(tournament);
                        }
                    });
                }
            });
        } catch (exception) {
            return res.json(SYSTEM_ERROR, {message: 'errorReportingMatch'});
        }
    } else {
        res.json(SERVER_APP_ERROR, {message: 'tournamentNotRunning'});
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
            return res.json(SYSTEM_ERROR, 'errorFindingMatchesToUnreport');
        }
    } else {
        return res.json([]);
    }
};

TournamentService.prototype.unreportMatch = function (req, res, tournament, TournamentModel) {
    var engine = this.getTournamentEngine(tournament.engine);
    if (tournament.running) {
        try {
            engine.unreport(req.body.number, tournament.bracket, function (err, data) {
                if (err) {
                    return res.json(SERVER_APP_ERROR, {error: 'errorUnreportingMatch', message: err.message});
                } else {
                    tournament.bracket = data;

                    TournamentModel.update({_id: tournament._id}, {bracket: data}, function (err) {
                        if (err) {
                            return res.json(SYSTEM_ERROR, {
                                error: 'errorUnreportingMatch',
                                message: 'Tournament update failed!'
                            });
                        } else {
                            return res.json(tournament);
                        }
                    });
                }
            });
        } catch (exception) {
            return res.json(SYSTEM_ERROR, {message: 'errorUnreportingMatch'});
        }
    } else {
        res.json(SERVER_APP_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.getTournamentWinners = function (req, res, tournament) {
    if (tournament.running) {
        var engine = this.getTournamentEngine(tournament.engine);
        engine.winners(tournament.bracket, function (err, data) {
            if (err) {
                res.json(SERVER_APP_ERROR, err);
            } else {
                res.json(data);
            }
        });
    } else {
        res.json(SERVER_APP_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.exportTournamentWinners = function (req, res, tournament) {
    var self = this;
    if (tournament.running) {
        var engine = this.getTournamentEngine(tournament.engine);
        engine.winners(tournament, function (err, data) {
            if (err) {
                res.json(SERVER_APP_ERROR, err);
            } else {
                var csv = self.utils().winnersToCSV(data);
                res.set('Content-Type', 'text/csv');
                res.set('Content-Disposition', 'attachment; filename=' + tournament.tournamentName + '.csv');
                res.send(csv);
            }
        });
    } else {
        res.json(SERVER_APP_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.unlockTournament = function (req, res, tournament, TournamentModel) {
    if (tournament.running) {
        res.json(SERVER_APP_ERROR, {message: 'cantUnlockRunningTournament'});
    } else {
        TournamentModel.update({_id: tournament._id}, {locked: false}, function (err) {
            if (err) {
                return res.json(SYSTEM_ERROR, {message: 'errorSavingTournamentData'});
            } else {
                return res.json(tournament);
            }
        });
    }
};

TournamentService.prototype.lockTournament = function (req, res, tournament, TournamentModel) {
    TournamentModel.update({_id: tournament._id}, {locked: true}, function (err) {
        if (err) {
            return res.json(SYSTEM_ERROR, {message: 'errorSavingTournamentData'});
        } else {
            return res.json(tournament);
        }
    });
};

TournamentService.prototype.multipleSeed = function (req, res, tournament, playersToAdd) {
    var uniquePlayersToAdd = _.uniq(playersToAdd, function (player) {
        return player.name.toLowerCase().trim();
    });
    var alreadyEnlistedPlayers = _.forEach(tournament.players, function (player) {
        return {name: player.name.toLowerCase().trim()};
    });

    _.forEach(uniquePlayersToAdd, function (playerToAdd) {
        if (alreadyEnlistedPlayers.length === 0 || !_.find(alreadyEnlistedPlayers, function (item) {
                return item.name.toLowerCase() === playerToAdd.name.toLowerCase().trim();
            })) {
            var playerToPush = {name: playerToAdd.name.trim()};
            if (playerToAdd.faction) {
                playerToPush.faction = playerToAdd.faction.trim();
            }
            tournament.players.push(playerToPush);
        }
    });

    return tournament;
};

TournamentService.prototype.rearrangePlayers = function (req, res, tournament) {
    if (!tournament.running) {
        var playerName = req.body.playerToMove;
        var target = req.body.newNextPlayer;
        var playerToMove = _.find(tournament.players, function (item) {
            return item.name === playerName;
        });
        var targetPlayer = _.find(tournament.players, function (item) {
            return item.name === target;
        });
        if (playerToMove) {
            if (targetPlayer || target === null) {
                var playersWithoutPlayerToMove = _.filter(tournament.players, function (item) {
                    return item.name !== playerName;
                });
                var updatedPlayersList = [];
                if (target !== null) {
                    for (var i = 0; i < playersWithoutPlayerToMove.length; i++) {
                        if (playersWithoutPlayerToMove[i].name === target) {
                            updatedPlayersList.push(playerToMove);
                        }
                        updatedPlayersList.push(playersWithoutPlayerToMove[i]);
                    }
                } else {
                    updatedPlayersList = playersWithoutPlayerToMove;
                    updatedPlayersList.push(playerToMove);
                }
                tournament.players = updatedPlayersList;
                tournament.save(function (err) {
                    if (err) {
                        return res.json(400, err);
                    } else {
                        return res.json(tournament);
                    }
                });
            } else {
                return res.json(SERVER_APP_ERROR, {message: 'playerToMoveNextToDoesNotExist'});
            }
        } else {
            return res.json(tournament);
        }
    } else {
        return res.json(SERVER_APP_ERROR, {message: 'unableToChangeOrderWhileTournamentIsLive'});
    }
};

function lookForMatchWherePlayerIsPresent(matchesToReport, playerName, matchesContainingPlayersToSwap) {
    _.each(matchesToReport, function (match) {
        if (match.player1.name === playerName || match.player2.name === playerName) {
            matchesContainingPlayersToSwap.push(match);
        }
    });
}
TournamentService.prototype.swapPlayers = function (req, res, tournament, TournamentModel) {
    var engine = this.getTournamentEngine(tournament.engine);
    engine.getMatchesToReport(tournament.bracket, function (err, matchesToReport) {
        if (!err && req.body.playerInMatch1 && req.body.playerInMatch2) {

            var matchesContainingPlayersToSwap = [];
            lookForMatchWherePlayerIsPresent(matchesToReport, req.body.playerInMatch1.name, matchesContainingPlayersToSwap);
            lookForMatchWherePlayerIsPresent(matchesToReport, req.body.playerInMatch2.name, matchesContainingPlayersToSwap);

            if (matchesContainingPlayersToSwap.length > 1) {
                var playerToSwapInMatch1 = matchesContainingPlayersToSwap[0].player1.name === req.body.playerInMatch1.name ? 'player1' : 'player2';
                var playerToSwapInMatch2 = matchesContainingPlayersToSwap[1].player1.name === req.body.playerInMatch2.name ? 'player1' : 'player2';

                engine.swapPlayers(matchesContainingPlayersToSwap[0], playerToSwapInMatch1, matchesContainingPlayersToSwap[1], playerToSwapInMatch2, tournament.bracket, function (err, data) {
                    if (err) {
                        res.json(SERVER_APP_ERROR, err);
                    } else {
                        tournament.bracket = data;
                        var tournamentId = tournament.signupID;
                        TournamentModel.update({signupID: tournamentId}, {bracket: data}, function (err) {
                            if (err) {
                                res.json(SYSTEM_ERROR, {
                                    error: 'errorReportingMatch',
                                    message: 'Tournament update failed!'
                                });
                            } else {
                                res.json(tournament);
                            }
                        });
                    }
                });
            } else {
                res.json(409, {message: 'noSwappablePlayersFound'});
            }
        } else {
            res.json(409, {message: 'errorWhenGettingPlayersToSwap'});
        }
    });
};

module.exports.TournamentService = TournamentService;