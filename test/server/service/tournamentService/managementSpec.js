'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;
describe('Tournament management', function () {
    var res = {};
    var tournamentService = {};
    var req = {body: {}};
    beforeEach(function () {
        tournamentService = new TournamentService();

        res = {
            json: function () {
            }
        };
        sinon.spy(res, 'json');
    });
    describe('Match reporting', function () {
        describe('getMatchesToReport', function () {

            it('should return an empty array if there s nothing to return and the call is ok', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        getMatchesToReport: function (bracket, callback) {
                            callback(false, []);
                        }
                    };
                };

                //action
                tournamentService.getMatchesToReport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
                assert.equal(res.json.calledOnce, true);
            });

            it('should return an error if engine call failed for some reason', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        getMatchesToReport: function (bracket, callback) {
                            callback(true, null);
                        }
                    };
                };
                //action
                tournamentService.getMatchesToReport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
                assert.equal(res.json.calledOnce, true);
            });

            it('should correctly handle an uncatched exception', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        getMatchesToReport: function () {
                            throw new Error('this is an uncatched exception');
                        }
                    };
                };
                //action
                tournamentService.getMatchesToReport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
                assert.equal(res.json.calledOnce, true);
            });

            it('should return an empty list if no tournament engine is specified', function () {
                //setup
                //action
                tournamentService.getMatchesToReport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
                assert.equal(res.json.calledOnce, true);
            });

            it('should return an error if no engine is found', function () {
                //setup
                //action
                tournamentService.getMatchesToReport(null, res, {engine: 'some engine'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
                assert.equal(res.json.calledOnce, true);
            });
        });
        describe('reportMatch', function () {
            it('should give a detailed error when engine.reportWin fails', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        reportWin: function (number, s1, s2, bracket, callback) {
                            callback({message: 'this is an error message from the engine'});
                        }
                    };
                };
                //action
                tournamentService.reportMatch(req, res, {engine: ''}, null);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].error, 'errorReportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'this is an error message from the engine');
                assert.equal(res.json.calledOnce, true);
            });

            it('should report a detailed error when tournament update fails', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        reportWin: function (number, s1, s2, bracket, callback) {
                            callback(false);
                        }
                    };
                };
                var model = {
                    update: function (criteria, data, callback) {
                        callback(true);
                    }
                };
                //action
                tournamentService.reportMatch(req, res, {engine: ''}, model);
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1].error, 'errorReportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'Tournament update failed!');
                assert.equal(res.json.calledOnce, true);
            });
        });
    });
    describe('Match unreporting', function () {
        describe('getMatchesToUnreport', function () {
            it('should return an empty array if there s nothing to return and the call is ok', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        getUnreportableMatches: function (bracket, callback) {
                            callback(false, []);
                        }
                    };
                };
                //action
                tournamentService.getMatchesToUnreport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
                assert.equal(res.json.calledOnce, true);
            });

            it('should return an error if engine call failed for some reason', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        getUnreportableMatches: function (bracket, callback) {
                            callback(true, null);
                        }
                    };
                };
                //action
                tournamentService.getMatchesToUnreport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToUnreport');
                assert.equal(res.json.calledOnce, true);
            });

            it('should correctly handle an uncatched exception', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        getMatchesToUnreport: function () {
                            throw new Error('this is an uncatched exception');
                        }
                    };
                };
                //action
                tournamentService.getMatchesToUnreport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToUnreport');
                assert.equal(res.json.calledOnce, true);
            });
            it('should return an empty list if no tournament engine is specified', function () {
                //setup
                //action
                tournamentService.getMatchesToUnreport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
                assert.equal(res.json.calledOnce, true);
            });
        });
        describe('unreportMatch', function () {
            it('should return a specific error if unreport fails', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        unreport: function (number, bracket, callback) {
                            callback({message: 'this is an error message from engine.unreport'});
                        }
                    };
                };
                //action
                tournamentService.unreportMatch(req, res, {bracket: {}}, null);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].error, 'errorUnreportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'this is an error message from engine.unreport');
                assert.equal(res.json.calledOnce, true);
            });

            it('should return a specific error if tournament unreport could not be saved', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {};
                        },
                        unreport: function (number, bracket, callback) {
                            callback(false, {});
                        }
                    };
                };
                var model = {
                    update: function (criteria, data, callback) {
                        callback(true);
                    }
                };
                //action
                tournamentService.unreportMatch(req, res, {bracket: {}}, model);
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1].error, 'errorUnreportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'Tournament update failed!');
                assert.equal(res.json.calledOnce, true);
            });
        });
    });
    describe('Rearrange Players', function () {
        it('should not try to update players list if player to move can t be found', function () {
            //setup
            var req = {
                body: {
                    playerToMove: 'player',
                    newNextPlayer: 'otherplayer'
                }
            };
            var tournament = {
                players: [{name: 'a'}, {name: 'b'}],
                save: function () {
                }
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(tournament, 'save');
            sinon.spy(res, 'json');

            //action
            tournamentService.rearrangePlayers(req, res, tournament);
            //assert
            assert.deepEqual(res.json.getCall(0).args[0].players, tournament.players);
            assert.equal(tournament.save.called, false);
            assert.equal(res.json.calledOnce, true);
        });

        it('should return an error if the player to move next to can t be found', function () {
            //setup
            var req = {
                body: {
                    playerToMove: 'player',
                    newNextPlayer: 'otherplayer'
                }
            };
            var tournament = {
                players: [{name: 'player'}, {name: 'b'}],
                save: function () {
                }
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(tournament, 'save');
            sinon.spy(res, 'json');
            //action
            tournamentService.rearrangePlayers(req, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 409);
            assert.equal(res.json.getCall(0).args[1].message, 'playerToMoveNextToDoesNotExist');
            assert.equal(res.json.calledOnce, true);
        });

        it('should move player next to the target if both nicks are in the players list of the tournament', function () {
            //setup
            var req = {
                body: {
                    playerToMove: 'player',
                    newNextPlayer: 'otherPlayer'
                }
            };
            var tournament = {
                players: [{name: 'player'}, {name: 'johnny'}, {name: 'otherPlayer'}],
                save: function (callback) {
                    callback(null, tournament);
                }
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(tournament, 'save');
            sinon.spy(res, 'json');
            //action
            tournamentService.rearrangePlayers(req, res, tournament);
            //assert
            assert.deepEqual(res.json.getCall(0).args[0].players, [{name: 'johnny'}, {name: 'player'}, {name: 'otherPlayer'}]);
            assert.equal(tournament.save.calledOnce, true);
            assert.equal(res.json.calledOnce, true);
        });

        it('should be able to move a player to the last spot in the list (i.e : target is null and player does exist)', function () {
            //setup
            var req = {
                body: {
                    playerToMove: 'player',
                    newNextPlayer: null
                }
            };
            var tournament = {
                players: [{name: 'player'}, {name: 'johnny'}, {name: 'otherPlayer'}],
                save: function (callback) {
                    callback(null, tournament);
                }
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(tournament, 'save');
            sinon.spy(res, 'json');
            //action
            tournamentService.rearrangePlayers(req, res, tournament);
            //assert
            assert.deepEqual(res.json.getCall(0).args[0].players, [{name: 'johnny'}, {name: 'otherPlayer'}, {name: 'player'}]);
            assert.equal(tournament.save.calledOnce, true);
            assert.equal(res.json.calledOnce, true);
        });

        it('should return an error if we try to change players order in a running tournament', function () {
            //setup
            var req = {
                body: {
                }
            };
            var tournament = {
                running:true
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.rearrangePlayers(req, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 409);
            assert.equal(res.json.getCall(0).args[1].message, 'unableToChangeOrderWhileTournamentIsLive');
            assert.equal(res.json.calledOnce, true);
        });
    });
});
