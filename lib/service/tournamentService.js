'use strict';
var _ = require('lodash');
var _utils = new (require('../utils/serverUtils'))();
var mongoose = require('mongoose');
var TournamentService = function () {
};

var CLIENT_ERROR = 400;
var SYSTEM_ERROR = 500;
var RANDOM_SEED = 'random';

TournamentService.prototype.enginesPath = '../engines/';

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

TournamentService.prototype.getTournament = function () {
    return mongoose.model('Tournament');
};

TournamentService.prototype.updateParentTournament = function (tournamentId, followingTournamentId, followingTournamentPublicId, callback) {
    var Tournament = this.getTournament();
    Tournament.update({_id: tournamentId, followingTournament: null}, {
        followingTournament: followingTournamentId,
        followingTournamentPublicId: followingTournamentPublicId
    }, {upsert: true}, function (err, data) {
        callback(err, data);
    });
};

TournamentService.prototype.updateTournamentAndTournamentUser = function (tournament, res, req, tournamentUser) {
    tournament.save(function (err) {
        if (err) {
            return res.json(CLIENT_ERROR, err);
        } else {
            if (req.session && req.session.passport && req.session.passport.user) {
                tournamentUser.tournamentId = tournament._id;
                tournamentUser.socialId = req.session.passport.user.id;
                tournamentUser.creator = true;
                tournamentUser.admin = true;
                tournamentUser.name = req.body.tournamentName;

                tournamentUser.save(function () {
                    tournament.adminURL = tournament._id;
                    tournament.signupURL = tournament.signupID;
                    return res.json(tournament);
                });
            } else {
                tournament.adminURL = tournament._id;
                tournament.signupURL = tournament.signupID;
                return res.json(tournament);
            }
        }
    });
};
TournamentService.prototype.saveTournament = function (req, res, newTournament, tournamentUser) {
    newTournament.signupID = this.utils().createTournamentId(new Date().getTime(), req.body.tournamentName);
    newTournament.provider = 'local';
    newTournament.engine = req.body.engine ? req.body.engine : 'singleElim';
    newTournament.creationTimestamp = new Date().getTime();

    var self = this;

    var parentTournamentId = req.body.parentTournament;
    if (parentTournamentId) {
        newTournament.parentTournament = parentTournamentId;

        self.updateParentTournament(parentTournamentId, newTournament._id, newTournament.signupID, function (err) {
            if (!err) {
                self.getTournament().findById(parentTournamentId, {}, function (err, parentTournament) {
                    var parentEngine = self.getTournamentEngine(parentTournament.engine);
                    if (parentEngine) {
                        parentEngine.winners(parentTournament, function (err, winners) {
                            if (winners && winners.length) {
                                newTournament.players = winners;
                                newTournament.parentTournamentPublicId = parentTournament.signupID;
                                self.updateTournamentAndTournamentUser(newTournament, res, req, tournamentUser);
                            } else {
                                return res.json(CLIENT_ERROR, {
                                    error: 'creationFailed',
                                    message: 'ParentTournamentIsNotOverYet'
                                });
                            }
                        });
                    } else {
                        return res.json(SYSTEM_ERROR, {
                            error: 'creationFailed',
                            message: 'CouldNotUpdateNewTournament'
                        });
                    }
                });
            } else {
                if (err.code === 11000) {
                    return res.json(CLIENT_ERROR, {
                        error: 'creationFailed',
                        message: 'CurrentTournamentAlreadyHasAFollowingTournament'
                    });
                } else {
                    return res.json(SYSTEM_ERROR, {error: 'updateFailed', message: 'CouldNotUpdateParentTournament'});
                }
            }
        });
    } else {
        self.updateTournamentAndTournamentUser(newTournament, res, req, tournamentUser);
    }
};


TournamentService.prototype.randomizePlayersList = function (playersList) {
    return _.shuffle(playersList);
};

TournamentService.prototype.updateTournament = function (req, res, tournament) {
    if(req.body && req.body.seed === RANDOM_SEED){
        tournament.players = this.randomizePlayersList(tournament.players);
    }
    tournament.save(function (err) {
        if (err) {
            return res.json(CLIENT_ERROR, err);
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
        return res.json(CLIENT_ERROR, {message: 'tournamentAlreadyRunning'});
    } else if (playerIsAlreadyRegistered()) {
        return res.json(CLIENT_ERROR, {message: 'noDuplicateNick'});
    } else if (tournament.locked && !lockingOverride) {
        return res.json(CLIENT_ERROR, {message: 'registrationLocked'});
    } else if (req.body.nick && req.body.nick.trim() && req.body.nick.length < 20) {
        tournament.players.push({name: req.body.nick, faction: req.body.faction});
        tournament.save(function (err) {
            if (err) {
                return res.json(SYSTEM_ERROR, {message: 'saveError'});
            }
            return res.json(tournament);
        });
    } else {
        return res.json(CLIENT_ERROR, {message: 'incorrectNick'});
    }
};

TournamentService.prototype.unregisterPlayer = function (req, res, tournament) {
    if (tournament.running) {
        return res.json(CLIENT_ERROR, {message: 'cantRemovePlayerWhileRunning'});
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

TournamentService.prototype.genPreconfigurationBracket = function (req, res, tournament) {
    if (tournament.players && tournament.players.length) {
        if (tournament.engine && tournament.engine !== 'none') {
            var engine = this.getTournamentEngine(tournament.engine);
            var that = this;
            if (engine) {
                if (engine.meta.compatible.indexOf('playerSwap') !== -1) {
                    engine.initPreconfigurationBracket(tournament.players, function (err, createdBracket) {
                        if (err) {
                            return res.json(SYSTEM_ERROR, {message: 'unableToGeneratePreconfigurationBracket'});
                        } else {
                            tournament.bracket = createdBracket;
                            tournament.running = false;
                            tournament.locked = false;
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
                    res.json(CLIENT_ERROR, {message: 'incompatibleEngine'});
                }
            } else {
                return res.json(CLIENT_ERROR, {
                    message: 'invalidTournamentEngine',
                    extra: 'Specified engine was : ' + engine
                });
            }
        } else {
            return res.json(CLIENT_ERROR, {message: 'noEngineSpecified'});
        }
    } else {
        return res.json(CLIENT_ERROR, {message: 'noPlayers'});
    }
};

TournamentService.prototype.updateBracketDataAndStart = function (req, res, tournament, TournamentModel) {
    if (tournament.players && tournament.players.length) {
        if (tournament.engine && tournament.engine !== 'none') {
            var engine = this.getTournamentEngine(tournament.engine);

            if (engine) {
                engine.updateBracketMatchesStatusesAndStandings(tournament.bracket, function (err, updatedBracket) {
                    if (err) {
                        return res.json(CLIENT_ERROR, err);
                    } else {
                        tournament.bracket = updatedBracket;
                        tournament.running = true;
                        tournament.locked = true;

                        TournamentModel.update({signupID: tournament.signupID}, {
                            bracket: tournament.bracket,
                            running: true,
                            locked: true
                        }, function (err) {
                            if (err) {
                                res.json(SYSTEM_ERROR, {
                                    error: 'errorUpdatingMatch',
                                    message: 'Tournament update failed!'
                                });
                            } else {
                                res.json(tournament);
                            }
                        });
                    }
                });
            } else {
                return res.json(CLIENT_ERROR, {message: 'invalidTournamentEngine'});
            }
        } else {
            return res.json(CLIENT_ERROR, {message: 'noEngineSpecified'});
        }
    } else {
        return res.json(CLIENT_ERROR, {message: 'noPlayers'});
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
                                return res.json(CLIENT_ERROR, err);
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
                        return res.json(CLIENT_ERROR, {message: 'invalidTournamentEngine'});
                    }
                } else {
                    return res.json(CLIENT_ERROR, {message: 'userPrivilegesMustBeSpecified'});
                }
            } else {
                return res.json(CLIENT_ERROR, {message: 'noEngineSpecified'});
            }
        } else {
            return res.json(CLIENT_ERROR, {message: 'noPlayers'});
        }
    } else {
        return res.json(CLIENT_ERROR, {message: 'tournamentAlreadyRunning'});
    }
};

TournamentService.prototype.stopTournament = function (req, res, tournament) {
    if (tournament.running) {
        tournament.bracket = {};
        tournament.running = false;
        tournament.locked = false;

        this.updateTournament(req, res, tournament, function (err, data) {
            if (err) {
                return res.json(SYSTEM_ERROR, err);
            } else {
                return res.json(data);
            }
        });
    } else {
        return res.json(CLIENT_ERROR, {message: 'tournamentAlreadyStopped'});
    }
};

TournamentService.prototype.getMatchesToReport = function (req, res, tournament) {
    if (tournament.engine) {
        var engine = this.getTournamentEngine(tournament.engine);
        try {
            engine.getMatchesToReport(tournament.bracket, function (err, data) {
                if (err) {
                    return res.json(CLIENT_ERROR, 'errorFindingMatchesToReport');
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
            engine.reportWin(req.body.number, req.body.score1, req.body.score2, tournament.bracket, req.body.matchComplete, function (err, data) {
                if (err) {
                    return res.json(CLIENT_ERROR, {error: 'errorReportingMatch', message: err.message});
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
        res.json(CLIENT_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.forfeitMatch = function (req, res, tournament, TournamentModel) {
    var engine = this.getTournamentEngine(tournament.engine);
    if (tournament.running) {
        try {
            engine.forfeit(req.body.number, req.body.forfeitSlot, req.body.score1, req.body.score2, tournament.bracket, function (err, data) {
                if (err) {
                    return res.json(CLIENT_ERROR, {error: 'errorReportingMatch', message: err.message});
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
        res.json(CLIENT_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.getMatchesToUnreport = function (req, res, tournament) {
    if (tournament.engine) {
        var engine = this.getTournamentEngine(tournament.engine);
        try {
            engine.getUnreportableMatches(tournament.bracket, function (err, data) {
                if (err) {
                    return res.json(CLIENT_ERROR, 'errorFindingMatchesToUnreport');
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
                    return res.json(CLIENT_ERROR, {error: 'errorUnreportingMatch', message: err.message});
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
        res.json(CLIENT_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.getTournamentWinners = function (req, res, tournament) {
    if (tournament.running) {
        var engine = this.getTournamentEngine(tournament.engine);
        engine.winners(tournament.bracket, function (err, data) {
            if (err) {
                res.json(CLIENT_ERROR, err);
            } else {
                res.json(data);
            }
        });
    } else {
        res.json(CLIENT_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.exportTournamentWinners = function (req, res, tournament) {
    var self = this;
    if (tournament.running) {
        var engine = this.getTournamentEngine(tournament.engine);
        engine.winners(tournament, function (err, data) {
            if (err) {
                res.json(CLIENT_ERROR, err);
            } else {
                var csv = self.utils().winnersToCSV(data);
                res.set('Content-Type', 'text/csv');
                res.set('Content-Disposition', 'attachment; filename=' + tournament.tournamentName + '.csv');
                res.send(csv);
            }
        });
    } else {
        res.json(CLIENT_ERROR, {message: 'tournamentNotRunning'});
    }
};

TournamentService.prototype.unlockTournament = function (req, res, tournament, TournamentModel) {
    if (tournament.running) {
        res.json(CLIENT_ERROR, {message: 'cantUnlockRunningTournament'});
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
                        return res.json(CLIENT_ERROR, err);
                    } else {
                        return res.json(tournament);
                    }
                });
            } else {
                return res.json(CLIENT_ERROR, {message: 'playerToMoveNextToDoesNotExist'});
            }
        } else {
            return res.json(tournament);
        }
    } else {
        return res.json(CLIENT_ERROR, {message: 'unableToChangeOrderWhileTournamentIsLive'});
    }
};

TournamentService.prototype.selectPlayerMatch = function (matchesToReport, playerName, matchNumber) {
    var matchToReturn = null;
    _.each(matchesToReport, function (match) {
        if (match.number === matchNumber) {
            matchToReturn = match;
        }
    });
    return matchToReturn;
};

TournamentService.prototype.areSwapParametersValid = function (playerInMatch1, playerInMatch2) {
    var result = true;
    if (!playerInMatch1 || !playerInMatch2 || !playerInMatch1.number || !playerInMatch2.number) {
        result = false;
    }
    return result;
};

TournamentService.prototype.swapPlayers = function (req, res, tournament, TournamentModel) {
    var engine = this.getTournamentEngine(tournament.engine);
    var self = this;

    if (this.areSwapParametersValid(req.body.playerInMatch1, req.body.playerInMatch2)) {

        var matchesContainingPlayersToSwap = [];
        var match1ToSwapFrom = self.selectPlayerMatch(tournament.bracket, req.body.playerInMatch1.name, req.body.playerInMatch1.number, req.body.playerInMatch1.isPlayer1);
        if (match1ToSwapFrom) {
            matchesContainingPlayersToSwap.push(match1ToSwapFrom);
        }
        var match2ToSwapFrom = self.selectPlayerMatch(tournament.bracket, req.body.playerInMatch2.name, req.body.playerInMatch2.number, req.body.playerInMatch2.isPlayer1);
        if (match2ToSwapFrom) {
            matchesContainingPlayersToSwap.push(match2ToSwapFrom);
        }

        if (matchesContainingPlayersToSwap.length > 1) {
            var playerToSwapInMatch1 = req.body.playerInMatch1.playerNumber;
            var playerToSwapInMatch2 = req.body.playerInMatch2.playerNumber;
            engine.swapPlayers(matchesContainingPlayersToSwap[0].number, playerToSwapInMatch1, matchesContainingPlayersToSwap[1].number, playerToSwapInMatch2, tournament.bracket, function (err, data) {
                if (err) {
                    res.json(CLIENT_ERROR, err);
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
            res.json(CLIENT_ERROR, {message: 'noSwappablePlayersFound'});
        }
    } else {
        res.json(CLIENT_ERROR, {message: 'errorWhenGettingPlayersToSwap'});
    }
};

TournamentService.prototype.getTournamentDataAndSaveTournamentUserAssociation = function (req, res, tournamentModel, TournamentUserModel, adminPageId, nextCallback) {
    tournamentModel.findById(adminPageId, function (err, tournamentData) {
        if (err) {
            return nextCallback(err);
        }
        else if (tournamentData) {
            if (req.session && req.session.passport && req.session.passport.user) {
                TournamentUserModel.findOne({
                    socialId: req.session.passport.user.id,
                    tournamentId: tournamentData._id
                }, function (err, data) {
                    if (!data) {
                        var tournamentUser = new TournamentUserModel();
                        tournamentUser.socialId = req.session.passport.user.id;
                        tournamentUser.name = tournamentData.tournamentName;
                        tournamentUser.tournamentId = tournamentData._id;
                        tournamentUser.creator = false;
                        tournamentUser.admin = true;
                        tournamentUser.save();
                    }
                });
            }
            return res.status(200).json(tournamentData);
        } else {
            res.status(404).send();
        }
    });
};

module.exports.TournamentService = TournamentService;