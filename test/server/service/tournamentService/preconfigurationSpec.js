'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;

describe('TournamentService - Preconfiguration', function () {
    it('should return an error if there are no valid matches to get players to swap', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                getMatchesToReport: function (bracket, callback) {
                    callback(null, []);
                }
            };
        };
        var req = {body: {playerInMatch1: {number: 1}, playerInMatch2: {number: 1}}};
        var res = {json: sinon.spy()};
        //action
        tournamentService.swapPlayers(req, res, {}, {});
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], 400);
        assert.deepEqual(res.json.getCall(0).args[1], {message: 'noSwappablePlayersFound'});
    });

    describe('areSwapParametersValid', function () {
        function testSwapParameters(player1, player2, expectedStatus) {
            //setup
            var tournamentService = new TournamentService();
            //action
            var actual = tournamentService.areSwapParametersValid(player1, player2);
            //assert
            assert.equal(actual, expectedStatus);
        }

        it('should return true if both players to swap are valid', function () {
            testSwapParameters({number: 1}, {number: 2}, true);
        });

        it('should return false if playerInMatch1 is null', function () {
            testSwapParameters(null, {}, false);
        });

        it('should return false if playerInMatch1.number is not defined', function () {
            testSwapParameters({}, {number: 1}, false);
        });

        it('should return false if playerInMatch2 is null', function () {
            testSwapParameters({}, null, false);
        });

        it('should return false if playerInMatch2.number is not defined', function () {
            testSwapParameters({number: 1}, {}, false);
        });
    });

    describe('selectPlayerMatch', function () {
        it('should return null if match cannot be found', function () {
            //setup
            var tournamentService = new TournamentService();
            //action
            var actual = tournamentService.selectPlayerMatch({}, '', 1, true);
            //assert
            assert.equal(actual, null);
        });

        it('should return corresponding match if player1 of match #1 has the correct name', function () {
            //setup
            var tournamentService = new TournamentService();
            var bracket = [{number: 1, player1: {name: 'player 1'}, player2: {name: 'player 2'}}];
            //action
            var actual = tournamentService.selectPlayerMatch(bracket, 'player 1', 1, true);
            //assert
            assert.deepEqual(actual, {number: 1, player1: {name: 'player 1'}, player2: {name: 'player 2'}});
        });

        it('should return corresponding match if player2 of match #1 has the correct name', function () {
            //setup
            var tournamentService = new TournamentService();
            var bracket = [{number: 1, player1: {name: 'player 1'}, player2: {name: 'player 2'}}];
            //action
            var actual = tournamentService.selectPlayerMatch(bracket, 'player 2', 1, false);
            //assert
            assert.deepEqual(actual, {number: 1, player1: {name: 'player 1'}, player2: {name: 'player 2'}});
        });
    });

    describe('actual engine call', function () {
        describe('if one player is defined', function () {
            it('should fail if player name does not match position', function () {
                //setup
                var tournamentService = new TournamentService();
                var mockedEngine = {
                    getMatchesToReport: function (bracket, callback) {
                        callback(null, [{player1: {name: '11'}, player2: {name: '12'}}, {
                            player1: {name: '21'},
                            player2: {name: '22'}
                        }]);
                    },
                    swapPlayers: sinon.spy()
                };
                tournamentService.getTournamentEngine = function () {
                    return mockedEngine;
                };
                var req = {
                    body: {
                        playerInMatch1: {name: '11', number: 1, isPlayer1: true},
                        playerInMatch2: {name: null, number: 1, isPlayer2: true}
                    }
                };
                var res = {json: sinon.spy()};
                //action
                tournamentService.swapPlayers(req, res, {
                    bracket: {
                        1: {player1: {name: '11'}, player2: {name: '12'}},
                        2: {player1: {name: '21'}, player2: {name: '22'}}
                    }
                }, {});
                //assert
                assert.equal(res.json.calledOnce, true);
                assert.deepEqual(res.json.getCall(0).args[0], 400);
                assert.deepEqual(res.json.getCall(0).args[1], {message: 'noSwappablePlayersFound'});
                assert.equal(mockedEngine.swapPlayers.called, false);
            });
        });
    });

    it('should call the engine to swap two players', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                swapPlayers: function (player1, player1Position, player2, player2Position, tournamentBracket, callback) {
                    callback(null, {
                        1: {player1: {name: '22'}, player2: {name: '12'}},
                        2: {player1: {name: '21'}, player2: {name: '11'}}
                    });
                }
            };
        };
        tournamentService.selectPlayerMatch = function () {
            return {};
        };
        var req = {
            body: {
                playerInMatch1: {name: '11', number: 1, isPlayer1: true},
                playerInMatch2: {name: '22', number: 2, isPlayer1: false}
            }
        };
        var tournamentModel = {
            update: function (params, data, callback) {
                callback(null, {});
            }
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.swapPlayers(req, res, {
            bracket: {
                1: {player1: {name: '11'}, player2: {name: '12'}},
                2: {player1: {name: '21'}, player2: {name: '22'}}
            }
        }, tournamentModel);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], {
            bracket: {
                1: {player1: {name: '22'}, player2: {name: '12'}},
                2: {player1: {name: '21'}, player2: {name: '11'}}
            }
        });
    });

    it('should call the engine to swap two players even if players to swap are reversed (when we consider match numbering)', function () {
        //setup
        var tournamentService = new TournamentService();
        var engine = {
            getMatchesToReport: function (bracket, callback) {
                callback(null, [{player1: {name: '11'}, player2: {name: '12'}, number: 1}, {
                    player1: {name: '21'},
                    player2: {name: '22'}, number: 2
                }]);
            },
            swapPlayers: sinon.spy()
        };
        tournamentService.getTournamentEngine = function () {
            return engine;
        };

        var stub = sinon.stub();
        stub.onCall(0).returns({
            number: 2,
            player1: {name: '21'},
            player2: {name: '22'}
        });
        stub.onCall(1).returns({
            number: 1,
            player1: {name: '11'},
            player2: {name: '12'}
        });
        tournamentService.selectPlayerMatch = stub;
        var req = {
            body: {
                playerInMatch1: {name: '22', number: 2, playerNumber:2},
                playerInMatch2: {name: '11', number: 1, playerNumber:1}
            }
        };
        var tournamentModel = {
            update: function (params, data, callback) {
                callback(null, {});
            }
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.swapPlayers(req, res, {
            bracket: {
                1: {player1: {name: '11'}, player2: {name: '12'}},
                2: {player1: {name: '21'}, player2: {name: '22'}}
            }
        }, tournamentModel);
        //assert
        assert.equal(engine.swapPlayers.calledOnce, true);
        assert.deepEqual(engine.swapPlayers.getCall(0).args[0], 2);
        assert.equal(engine.swapPlayers.getCall(0).args[1], 2);
        assert.deepEqual(engine.swapPlayers.getCall(0).args[2], 1);
        assert.equal(engine.swapPlayers.getCall(0).args[3], 1);
    });

    function errorReturnTestWhenPlayersToSwapNotProperlyDefined(requestBody, expectedMessage) {
//setup
        var tournamentService = new TournamentService();
        var engine = {
            getMatchesToReport: function (bracket, callback) {
                callback(null, [{player1: {name: '11'}, player2: {name: '12'}}, {
                    player1: {name: '21'},
                    player2: {name: '22'}
                }]);
            },
            swapPlayers: sinon.spy()
        };
        tournamentService.getTournamentEngine = function () {
            return engine;
        };
        var req = {body: requestBody};
        var tournamentModel = {
            update: function (params, data, callback) {
                callback(null, {});
            }
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.swapPlayers(req, res, {
            bracket: {
                1: {player1: {name: '11'}, player2: {name: '12'}},
                2: {player1: {name: '21'}, player2: {name: '22'}}
            }
        }, tournamentModel);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], 400);
        assert.deepEqual(res.json.getCall(0).args[1], {message: expectedMessage});
    }

    it('should return an error if no players can be found in matches', function () {
        errorReturnTestWhenPlayersToSwapNotProperlyDefined({
            playerInMatch1: {number: 1},
            playerInMatch2: {number: 1}
        }, 'noSwappablePlayersFound');
    });

    it('should return an error if only player1 can be found in matches', function () {
        errorReturnTestWhenPlayersToSwapNotProperlyDefined({
            playerInMatch1: {name: '11', number: 1},
            playerInMatch2: {number: 1}
        }, 'noSwappablePlayersFound');
    });

    it('should return an error if only player2 can be found in matches', function () {
        errorReturnTestWhenPlayersToSwapNotProperlyDefined({
            playerInMatch1: {number: 1},
            playerInMatch2: {name: '11', number: 1}
        }, 'noSwappablePlayersFound');
    });

    it('should return an error if only player1 is not defined at all', function () {
        errorReturnTestWhenPlayersToSwapNotProperlyDefined({playerInMatch2: {name: '21'}}, 'errorWhenGettingPlayersToSwap');
    });

    it('should return an error if player1 is defined but has no match id', function () {
        errorReturnTestWhenPlayersToSwapNotProperlyDefined({
            playerInMatch1: {name: '11'},
            playerInMatch2: {name: '11'}
        }, 'errorWhenGettingPlayersToSwap');
    });

    it('should return an error if player2 is defined but has no match id', function () {
        errorReturnTestWhenPlayersToSwapNotProperlyDefined({
            playerInMatch1: {name: '11', number: 1},
            playerInMatch2: {name: '11'}
        }, 'errorWhenGettingPlayersToSwap');
    });

    it('should return an error if only player2 is not defined at all', function () {
        errorReturnTestWhenPlayersToSwapNotProperlyDefined({playerInMatch1: {name: '11'}}, 'errorWhenGettingPlayersToSwap');
    });

    it('should allow to swap players in the same match', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                swapPlayers: function (player1, player1Position, player2, player2Position, tournamentBracket, callback) {
                    callback(null, {
                        1: {player1: {name: '12'}, player2: {name: '11'}}
                    });
                }
            };
        };
        var req = {
            body: {
                playerInMatch1: {name: '11', number: 1, isPlayer1: true},
                playerInMatch2: {name: '12', number: 1, isPlayer1: false}
            }
        };
        tournamentService.selectPlayerMatch = function () {
            return {};
        };
        var tournamentModel = {
            update: function (params, data, callback) {
                callback(null, {});
            }
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.swapPlayers(req, res, {
            bracket: {
                1: {player1: {name: '11'}, player2: {name: '12'}}
            }
        }, tournamentModel);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], {
            bracket: {
                1: {player1: {name: '12'}, player2: {name: '11'}}
            }
        });
    });

    it('should bubble the engine error if engine.swapPlayers fails', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                getMatchesToReport: function (bracket, callback) {
                    callback(null, {});
                },
                swapPlayers: function (player1, player1Position, player2, player2Position, tournamentBracket, callback) {
                    callback({message: 'cantSwapPlayerInMatchThatIsOver'});
                }
            };
        };
        tournamentService.selectPlayerMatch = function () {
            return {number: 1, player1: {}, player2: {}};
        };
        var req = {body: {playerInMatch1: {name: '11', number: 1}, playerInMatch2: {name: '22', number: 1}}};
        var tournamentModel = {};
        var res = {json: sinon.spy()};
        //action
        tournamentService.swapPlayers(req, res, {
            bracket: {
                1: {player1: {name: '11'}, player2: {name: '12'}},
                2: {player1: {name: '21'}, player2: {name: '22'}}
            }
        }, tournamentModel);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], 400);
        assert.deepEqual(res.json.getCall(0).args[1], {message: 'cantSwapPlayerInMatchThatIsOver'});
    });

    it('should return a system error if save fails', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                getMatchesToReport: function (bracket, callback) {
                    callback(null, [{player1: {name: '11'}, player2: {name: '12'}}, {
                        player1: {name: '21'},
                        player2: {name: '22'}
                    }]);
                },
                swapPlayers: function (player1, player1Position, player2, player2Position, tournamentBracket, callback) {
                    callback(null, {});
                }
            };
        };
        var req = {body: {playerInMatch1: {name: '11', number: 1}, playerInMatch2: {name: '22', number: 1}}};
        var tournamentModel = {
            update: function (a, b, callback) {
                callback(true);
            }
        };
        tournamentService.selectPlayerMatch = function () {
            return {number: 1, player1: {}, player2: {}};
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.swapPlayers(req, res, {
            bracket: {
                1: {player1: {name: '11'}, player2: {name: '12'}},
                2: {player1: {name: '21'}, player2: {name: '22'}}
            }
        }, tournamentModel);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], 500);
        assert.deepEqual(res.json.getCall(0).args[1], {
            error: 'errorReportingMatch',
            message: 'Tournament update failed!'
        });
    });

    describe('getPreconfigurationBracket', function () {
        it('should return an error message if engine is not compatible with pre-configuration', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {};
            var res = {json: sinon.spy()};
            tournamentService.getTournamentEngine = function () {
                return {meta: {compatible: []}};
            };
            var tournament = {engine: 'notPreconfigurable', players: [{}]};
            //action
            tournamentService.genPreconfigurationBracket(req, res, tournament);
            //assert
            assert.deepEqual(res.json.calledOnce, true);
            assert.deepEqual(res.json.getCall(0).args, [400, {message: 'incompatibleEngine'}]);
        });

        it('should call the engine\'s initPreconfigurationBracket if engine is compatible', function () {
            //setup
            var tournamentService = new TournamentService();
            var req = {};
            var res = {json: sinon.spy()};
            var engine =
            {
                meta: {compatible: ['playerSwap']}, initPreconfigurationBracket: function (params, callback) {
                callback(null, {});
            }
            };
            sinon.spy(engine, 'initPreconfigurationBracket');
            tournamentService.updateTournament = function (req, res, tournament, callback) {
                callback(null, {a: 1});
            };
            tournamentService.getTournamentEngine = function () {
                return engine;
            };
            var tournament = {engine: 'preconfigurable', players: [{}]};
            //action
            tournamentService.genPreconfigurationBracket(req, res, tournament);
            //assert
            assert.equal(engine.initPreconfigurationBracket.calledOnce, true);
            assert.equal(res.json.calledOnce, true);
            assert.deepEqual(res.json.getCall(0).args, [{a:1}]);
        });

        it('should return bubble a server error if the server could not generate the preconfiguration bracket', function(){
            //setup
            var tournamentService = new TournamentService();
            var req = {};
            var res = {json: sinon.spy()};
            var engine =
            {
                meta: {compatible: ['playerSwap']}, initPreconfigurationBracket: function (params, callback) {
                callback(true);
            }
            };
            sinon.spy(engine, 'initPreconfigurationBracket');
            tournamentService.updateTournament = sinon.spy();
            tournamentService.getTournamentEngine = function () {
                return engine;
            };
            var tournament = {engine: 'preconfigurable', players: [{}]};
            //action
            tournamentService.genPreconfigurationBracket(req, res, tournament);
            //assert
            assert.deepEqual(res.json.calledOnce, true);
            assert.deepEqual(res.json.getCall(0).args, [500, {message: 'unableToGeneratePreconfigurationBracket'}]);
            assert.equal(tournamentService.updateTournament.called, false);
        });
    });
});