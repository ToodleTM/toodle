var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../lib/service/tournamentService').TournamentService;

describe('Tournament Service', function () {

    it('should return an error if save fails', function () {
        //setup
        var tournamentService = new TournamentService();
        var model = {save: function (callback) {
            callback(true);
        }};

        var res = {json: function (status, data) {
        }};
        sinon.spy(res, 'json');

        //action
        tournamentService.saveTournament({body: {}}, res, model);
        //assert
        assert.equal(400, res.json.getCall(0).args[0]);
    });
    describe("Tournament Creation ", function () {
        describe('Tournament Start', function () {
            it('should use a tournament engine to create tournament bracket and return the created bracket', function () {
                //setup
                var tournamentService = new TournamentService();
                var mockEngine = {initBracket: function (players, callback) {
                    callback(null, {init: true});
                }};
                var mockEngineSpy = sinon.spy(mockEngine, 'initBracket');
                var getTournamentEngineStub = sinon.stub().returns(mockEngine);
                tournamentService.getTournamentEngine = getTournamentEngineStub;
                var tournament = {engine: 'tournamentEngine', players: [
                    {name: 'john'},
                    {name: 'mary'}
                ], save: function () {
                    return res.json({init: true})
                }};
                tournamentService.updateTournament = function (req, res, tournament, callback) {
                    callback(null, tournament);
                };
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                //action
                tournamentService.startTournament({}, res, tournament);
                //assert
                assert.equal(getTournamentEngineStub.called, true);
                assert.equal(getTournamentEngineStub.getCall(0).args[0], 'tournamentEngine');
                assert.equal(mockEngineSpy.getCall(0).args[0][0].name, 'john');
                assert.equal(mockEngineSpy.getCall(0).args[0][1].name, 'mary');
                assert.equal(res.json.getCall(0).args[0].bracket.init, true);
            });

            it('should be able to detect tournament engine errors @ init', function () {
                //setup
                var tournamentService = new TournamentService();
                var mockEngine = {initBracket: function (players, callback) {
                    callback({message: 'thisIsAnError'}, null);
                }};
                var getTournamentEngineStub = sinon.stub().returns(mockEngine);
                tournamentService.getTournamentEngine = getTournamentEngineStub;
                var tournament = {engine: 'tournamentEngine', players: [
                    {name: 'john'},
                    {name: 'mary'}
                ], save: function () {
                }};
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                //action
                tournamentService.startTournament({}, res, tournament);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].message, 'thisIsAnError');
            });

            it('should reject tournament start request if no engine is specified', function () {
                //setup
                var tournamentService = new TournamentService();
                var tournament = {engine: null, players: [
                    {name: 'john'}
                ]};
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                //action
                tournamentService.startTournament({}, res, tournament);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].message, 'noEngineSpecified');
            });

            it('should save tournament bracket if bracket creation succeeds', function () {
                //setup
                var tournamentService = new TournamentService();
                var mockEngine = {initBracket: function (players, callback) {
                    callback(null, {init: true});
                }};
                sinon.spy(mockEngine, 'initBracket');
                var getTournamentEngineStub = sinon.stub().returns(mockEngine);
                tournamentService.getTournamentEngine = getTournamentEngineStub;
                var tournament = {engine: 'tournamentEngine', players: [
                    {name: 'john'},
                    {name: 'mary'}
                ], save: function () {
                }};
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                sinon.spy(tournamentService, 'updateTournament');
                //action
                tournamentService.startTournament({}, res, tournament);
                //assert
                assert.notEqual(tournamentService.updateTournament.getCall(0), null);
                assert.equal(tournamentService.updateTournament.getCall(0).args[2].running, true);
                assert.equal(tournamentService.updateTournament.getCall(0).args[2].locked, true);
                assert.equal(tournamentService.updateTournament.getCall(0).args[2].bracket.init, true);
            });

            it('should not be able to start an already running tournament', function () {
                //setup
                var tournamentService = new TournamentService();
                var tournament = {running: true};
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                //action
                tournamentService.startTournament({}, res, tournament);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].message, 'tournamentAlreadyRunning');
            });

            it('Should not be able to start a tournament with no players', function () {
                //setup
                var tournamentService = new TournamentService();
                var tournament = {};
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                //action
                tournamentService.startTournament({}, res, tournament);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].message, 'noPlayers');
            });

            it('should return an error if no matching tournament engine is found', function () {
                //setup
                var tournamentService = new TournamentService();
                var tournament = {players: [
                    {name: 'bob'}
                ], engine: 'some engine'};
                var res = {json: function () {
                }};
                tournamentService.getTournamentEngine = function () {
                    return null
                };
                sinon.spy(res, 'json');
                //action
                tournamentService.startTournament({}, res, tournament);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].message, 'invalidTournamentEngine');
            });
        });
        describe('Tournament Stop', function () {
            it('should be able to stop the tournament if it s running', function () {
                //setup
                var tournamentService = new TournamentService();
                var tournament = {running: true, save: function (callback) {
                    callback(null);
                }};
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                sinon.spy(tournamentService, 'updateTournament');
                //action
                tournamentService.stopTournament({}, res, tournament);
                //assert
                assert.equal(res.json.getCall(0).args[0].running, false);
                var updateTournamentCall = tournamentService.updateTournament.getCall(0);
                assert.notEqual(updateTournamentCall, null);
                assert.equal(updateTournamentCall.args[2].running, false);
                assert.equal(Object.keys(updateTournamentCall.args[2].bracket).length, 0);
            });
            it('should not allow stopping a not running tournament', function () {
                //setup
                var tournamentService = new TournamentService();
                var tournament = {running: false, save: function (callback) {
                    callback(null);
                }};
                var res = {json: function () {
                }};
                sinon.spy(res, 'json');
                //action
                tournamentService.stopTournament({}, res, tournament);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].message, 'tournamentAlreadyStopped');
            });
        });
    });
    it('should return admin and user URLs if save succeeds', function () {
        //setup
        var tournamentService = new TournamentService();
        var model = {save: function (callback) {
            callback(false);
        }, _id: 'abc'};

        var res = {json: function (status, data) {
        }};
        sinon.spy(res, 'json');

        var req = {body: {tournamentName: 'tournamentName'}};

        //action
        tournamentService.saveTournament(req, res, model);
        //assert
        assert.equal(res.json.getCall(0).args[0].adminURL, 'abc');
        assert.match(res.json.getCall(0).args[0].signupURL, /^tournamentName[0-9]+$/);
    });

    describe('Player registration', function () {
        it('should reject a player registration w/ an empty player name', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: ''}};
            var res = {json: function (returnCode, data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: []});
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'noEmptyNick');
        });

        it('should reject a player registration w/ a blank player name', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: '\t     '}};
            var res = {json: function (returnCode, data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: []});
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'noEmptyNick');
        });

        it('should reject a player registration if tournament is locked', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: 'MAdJoHn_37658'}};
            var res = {json: function (returnCode, data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: [], locked: true});
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'registrationLocked');
        });

        it('should not allow registration of the same player twice (strict)', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: 'toto'}};
            var res = {json: function (returnCode, data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: [
                {name: 'toto'}
            ]});
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'noDuplicateNick');
        });

        it('should not allow registration of the same player twice (using mixed capitalization in nick)', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: 'TOtO'}};
            var res = {json: function (returnCode, data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: [
                {name: 'toto'}
            ]});
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'noDuplicateNick');
        });

        it('should allow registration when nick is not empty and unused', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: 'toto'}};
            var res = {json: function (data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: [
                {name: 'titi'}
            ], save: function (callback) {
                callback(false);
            }});
            //assert
            assert.equal(res.json.getCall(0).args[0].players[0].name, 'titi');
            assert.equal(res.json.getCall(0).args[0].players[1].name, 'toto');
        });

        it('should return an error if new nick is valid but the app can t save', function () {
            var tournamentService = new TournamentService();
            var req = {body: {nick: 'toto'}};
            var res = {json: function (data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: [
                {name: 'titi'}
            ], save: function (callback) {
                callback(true);
            }});
            //assert
            assert.equal(res.json.getCall(0).args[0], 500);
            assert.equal(res.json.getCall(0).args[1].message, 'saveError');
        });

        it('should allow player add when using the admin id even if tournament is locked', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: 'MAdJoHn_37658'}};
            var res = {json: function (returnCode, data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: [], locked: true, save: function (callback) {
                callback(false)
            }}, true);
            //assert
            assert.equal(res.json.getCall(0).args[0].players[0].name, 'MAdJoHn_37658');
        });

        it('should not allow player registration if tournament is in progress (running)', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {body: {nick: 'MAdJoHn_37658'}};
            var res = {json: function (returnCode, data) {
            }};
            sinon.spy(res, 'json');
            //action
            tournamentService.registerPlayer(req, res, {players: [], running: true, save: function (callback) {
                callback(false)
            }}, true);
            //assert
            assert.equal(res.json.getCall(0).args[0], 409);
            assert.equal(res.json.getCall(0).args[1].message, 'tournamentAlreadyRunning');
        });

    });

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
                                return {}
                            },
                            getMatchesToReport: function (bracket, callback) {
                                callback(false, []);
                            }
                        }
                    };

                    //action
                    tournamentService.getMatchesToReport(null, res, {});
                    //assert
                    assert.equal(res.json.getCall(0).args[0].length, 0);
                });

                it('should return an error if engine call failed for some reason', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            getMatchesToReport: function (bracket, callback) {
                                callback(true, null);
                            }
                        }
                    };
                    //action
                    tournamentService.getMatchesToReport(null, res, {engine: 'dummy'});
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 409);
                    assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
                });

                it('should correctly handle an uncatched exception', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            getMatchesToReport: function (bracket, callback) {
                                throw new Error('this is an uncatched exception');
                            }
                        }
                    };
                    //action
                    tournamentService.getMatchesToReport(null, res, {engine: 'dummy'});
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 500);
                    assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
                });

                it('should return an empty list if no tournament engine is specified', function () {
                    //setup
                    //action
                    tournamentService.getMatchesToReport(null, res, {});
                    //assert
                    assert.equal(res.json.getCall(0).args[0].length, 0);
                });

                it('should return an error if no engine is found', function () {
                    //setup
                    //action
                    tournamentService.getMatchesToReport(null, res, {engine: 'some engine'})
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 500);
                    assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
                });
            });
            describe('reportMatch', function () {
                it('should give a detailed error when engine.reportWin fails', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            reportWin: function (number, s1, s2, bracket, callback) {
                                callback({message: 'this is an error message from the engine'});
                            }
                        }
                    };
                    //action
                    tournamentService.reportMatch(req, res, {engine: ''}, null);
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 409);
                    assert.equal(res.json.getCall(0).args[1].error, 'errorReportingMatch');
                    assert.equal(res.json.getCall(0).args[1].message, 'this is an error message from the engine');
                });

                it('should report a detailed error when tournament update fails', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            reportWin: function (number, s1, s2, bracket, callback) {
                                callback(false);
                            }
                        }
                    };
                    var model = {update: function (criteria, data, callback) {
                        callback(true);
                    }};
                    //action
                    tournamentService.reportMatch(req, res, {engine: ''}, model);
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 500);
                    assert.equal(res.json.getCall(0).args[1].error, 'errorReportingMatch');
                    assert.equal(res.json.getCall(0).args[1].message, 'Tournament update failed!');
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
                                return {}
                            },
                            getUnreportableMatches: function (bracket, callback) {
                                callback(false, []);
                            }
                        }
                    };
                    //action
                    tournamentService.getMatchesToUnreport(null, res, {});
                    //assert
                    assert.equal(res.json.getCall(0).args[0].length, 0);
                });

                it('should return an error if engine call failed for some reason', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            getUnreportableMatches: function (bracket, callback) {
                                callback(true, null);
                            }
                        }
                    };
                    //action
                    tournamentService.getMatchesToUnreport(null, res, {engine: 'dummy'});
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 409);
                    assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToUnreport');
                });

                it('should correctly handle an uncatched exception', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            getMatchesToUnreport: function (bracket, callback) {
                                throw new Error('this is an uncatched exception');
                            }
                        }
                    };
                    //action
                    tournamentService.getMatchesToUnreport(null, res, {engine: 'dummy'});
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 500);
                    assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToUnreport');
                });
                it('should return an empty list if no tournament engine is specified', function () {
                    //setup
                    //action
                    tournamentService.getMatchesToUnreport(null, res, {});
                    //assert
                    assert.equal(res.json.getCall(0).args[0].length, 0);
                });
            });
            describe('unreportMatch', function () {
                it('should return a specific error if unreport fails', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            unreport: function (number, bracket, callback) {
                                callback({message: 'this is an error message from engine.unreport'})
                            }
                        }
                    };
                    //action
                    tournamentService.unreportMatch(req, res, {bracket: {}}, null);
                    //assert
                    assert.equal(res.json.getCall(0).args[0], 409);
                    assert.equal(res.json.getCall(0).args[1].error, 'errorUnreportingMatch');
                    assert.equal(res.json.getCall(0).args[1].message, 'this is an error message from engine.unreport');
                });

                it('should return a specific error if tournament unreport could not be saved', function () {
                    //setup
                    tournamentService.getTournamentEngine = function () {
                        return {
                            initBracket: function () {
                                return {}
                            },
                            unreport: function (number, bracket, callback) {
                                callback(false, {})
                            }
                        }
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
                });
            });
        })
    });

    describe('Tournament locking / unlocking', function () {
        it('should be possible to lock anytime', function () {
            //setup
            var tournamentService = new TournamentService();
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            var tournament = {running: false};
            var model = {update: function (selector, data, callback) {
                callback(null, {});
            }};
            sinon.spy(model, 'update');
            //action
            tournamentService.lockTournament(null, res, tournament, model);
            //assert
            assert.equal(res.json.getCall(0).args[0], tournament);
            assert.equal(model.update.calledOnce, true);
        });

        it('should not be possible to unlock if tournament is running', function () {
            //setup
            var tournamentService = new TournamentService();
            var res = {
                json: function () {}
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.unlockTournament(null, res, {running: true}, null);
            //assert
            assert.equal(res.json.getCall(0).args[0], 409);
            assert.equal(res.json.getCall(0).args[1].message, 'cantUnlockRunningTournament')
        });

        it('should be possible to unlock if tournament is not running', function () {
            //setup
            var tournamentService = new TournamentService();
            var res = {
                json: function () {
                }
            };
            var tournament = {};

            var model = {
                update: function (a, b, callback) {
                    callback(null, {});
                }
            };

            sinon.spy(res, 'json');
            //action
            tournamentService.unlockTournament(null, res, tournament, model);
            //assert
            assert.equal(res.json.getCall(0).args[0], tournament);
        });
    });

    describe('Get tournament engine', function () {
        it('should return null if tournament engine does not exist', function () {
            //setup
            var tournamentService = new TournamentService();
            //action
            var actual = tournamentService.getTournamentEngine('bob');
            //assert
            assert.equal(actual, null);
        });
    });
});