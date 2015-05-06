'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../lib/service/tournamentService').TournamentService;

describe('Tournament Service', function () {

    it('should return an error if save fails', function () {
        //setup
        var tournamentService = new TournamentService();
        var model = {
            save: function (callback) {
                callback(true);
            }
        };

        var res = {
            json: function () {
            }
        };
        sinon.spy(res, 'json');

        //action
        tournamentService.saveTournament({body: {}}, res, model);
        //assert
        assert.equal(400, res.json.getCall(0).args[0]);
        assert.equal(res.json.calledOnce, true);
    });

    it('should save the tournament / user association when creating a tournament if user is logged in', function () {
        //setup
        var tournamentService = new TournamentService();
        var tournamentModel = {
            save: function (callback) {
                callback(null);
            }
        };
        tournamentModel._id = 'tid';
        var originalCreateTournamentId = tournamentService.utils().createTournamentId;
        tournamentService.utils().createTournamentId = function () {
            return 'sid';
        };

        var tournamentUserModel = {
            save: function (callback) {
                callback(null);
            }
        };
        var req = {
            body: {tournamentName: 'tournamentName'},
            session: {
                passport: {user: {id: 'userId'}}
            }
        };

        var res = {
            json: function () {
            }
        };

        sinon.spy(res, 'json');
        sinon.spy(tournamentUserModel, 'save');
        //action
        tournamentService.saveTournament(req, res, tournamentModel, tournamentUserModel);
        //assert
        assert.equal(tournamentUserModel.save.calledOnce, true);
        assert.equal(tournamentUserModel.tournamentId, 'tid');
        assert.equal(tournamentUserModel.socialId, 'userId');
        assert.equal(tournamentUserModel.creator, true);
        assert.equal(tournamentUserModel.admin, true);
        assert.equal(tournamentUserModel.name, 'tournamentName');
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], {adminURL: 'tid', signupURL: 'sid'});
        tournamentService.utils().createTournamentId = originalCreateTournamentId;
    });

    it('should return admin and user URLs if save succeeds', function () {
        //setup
        var tournamentService = new TournamentService();
        var model = {
            save: function (callback) {
                callback(false);
            }, _id: 'abc'
        };

        var res = {
            json: function () {
            }
        };
        sinon.spy(res, 'json');

        var req = {
            body: {tournamentName: 'tournamentName'}
        };

        //action
        tournamentService.saveTournament(req, res, model, {
            save: function (callback) {
                callback(null);
            }
        });
        //assert
        assert.equal(res.json.getCall(0).args[0].adminURL, 'abc');
        assert.match(res.json.getCall(0).args[0].signupURL, /^tournamentName[0-9]+$/);
        assert.equal(res.json.calledOnce, true);
    });

    it('should return a correctly structured message when unreport wrapper catches an exception', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                unreport: function () {
                    throw new Error('new exception');
                }
            };
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.unreportMatch(null, res, {running: true, engine: 'someEngine'}, null);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.equal(res.json.getCall(0).args[0], 500);
        assert.equal(res.json.getCall(0).args[1].message, 'errorUnreportingMatch');
    });

    it('should return an error message if user wants to report a match on a tournament that has not started yet', function () {
        //setup
        var tournamentService = new TournamentService();

        var res = {json: sinon.spy()};
        //action
        tournamentService.reportMatch(null, res, {running: false, engine: 'singleElim'}, null);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.equal(res.json.getCall(0).args[0], 409);
        assert.equal(res.json.getCall(0).args[1].message, 'tournamentNotRunning');
    });

    it('should return an error message if user wants to report a match on a tournament that has not started yet', function () {
        //setup
        var tournamentService = new TournamentService();

        var res = {json: sinon.spy()};
        //action
        tournamentService.unreportMatch(null, res, {running: false, engine: 'singleElim'}, null);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.equal(res.json.getCall(0).args[0], 409);
        assert.equal(res.json.getCall(0).args[1].message, 'tournamentNotRunning');
    });

    it('should return an error message if user asked for winners of a stopped tournament', function () {
        //setup
        var tournamentService = new TournamentService();

        var res = {json: sinon.spy()};
        //action
        tournamentService.getTournamentWinners(null, res, {running: false, engine: 'singleElim'});
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.equal(res.json.getCall(0).args[0], 409);
        assert.equal(res.json.getCall(0).args[1].message, 'tournamentNotRunning');
    });

    it('should return an array w/ the tournamentWinners if user asked for winners of a finished tournament', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                winners: function (tournament, callback) {
                    callback(null, [{name: 'john'}, {name: 'jane'}]);
                }
            };
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.getTournamentWinners(null, res, {running: true, engine: 'singleElim'});
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], [{name: 'john'}, {name: 'jane'}]);
    });

    it('should return an error if user asked for winners of a tournament but the engine returned an error', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                winners: function (tournament, callback) {
                    callback({message: 'some error from the engine'});
                }
            };
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.getTournamentWinners(null, res, {running: true, engine: 'singleElim'});
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], 409);
        assert.deepEqual(res.json.getCall(0).args[1].message, 'some error from the engine');
    });

    it('should return an error message if user asked for winners of a stopped tournament', function () {
        //setup
        var tournamentService = new TournamentService();

        var res = {json: sinon.spy()};
        //action
        tournamentService.exportTournamentWinners(null, res, {running: false, engine: 'singleElim'});
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.equal(res.json.getCall(0).args[0], 409);
        assert.equal(res.json.getCall(0).args[1].message, 'tournamentNotRunning');
    });

    it('should return a CSV file w/ the tournamentWinners if user asked for winners of a finished tournament', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                winners: function (tournament, callback) {
                    callback(null, [{name: 'john'}, {name: 'jane'}]);
                }
            };
        };
        tournamentService.utils = function () {
            return {
                winnersToCSV: function () {
                    return new Buffer('');
                }
            };
        };
        var res = {send: sinon.spy(), set: sinon.spy()};
        //action
        tournamentService.exportTournamentWinners(null, res, {
            tournamentName: 'some fancy tournament name',
            running: true,
            engine: 'singleElim'
        });
        //assert
        assert.equal(res.send.calledOnce, true);
        assert.equal(res.set.calledTwice, true);
        assert.deepEqual(res.set.getCall(0).args[0], 'Content-Type');
        assert.deepEqual(res.set.getCall(0).args[1], 'text/csv');
        assert.deepEqual(res.set.getCall(1).args[0], 'Content-Disposition');
        assert.deepEqual(res.set.getCall(1).args[1], 'attachment; filename=some fancy tournament name.csv');
        assert.deepEqual(res.send.getCall(0).args[0], new Buffer(''));
    });

    it('should return an error if user asked for winners of a tournament but the engine returned an error', function () {
        //setup
        var tournamentService = new TournamentService();
        tournamentService.getTournamentEngine = function () {
            return {
                winners: function (tournament, callback) {
                    callback({message: 'some error from the engine'});
                }
            };
        };
        var res = {json: sinon.spy()};
        //action
        tournamentService.exportTournamentWinners(null, res, {running: true, engine: 'singleElim'});
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], 409);
        assert.deepEqual(res.json.getCall(0).args[1].message, 'some error from the engine');
    });

    describe('swapPlayers', function () {
        it('should return an error if engine.getMatchesToReportFails', function () {
            //setup
            var tournamentService = new TournamentService();
            tournamentService.getTournamentEngine = function () {
                return {
                    getMatchesToReport: function (bracket, callback) {
                        callback({});
                    }
                };
            };
            var req = {};
            var res = {json: sinon.spy()};
            //action
            tournamentService.swapPlayers(req, res, {}, {});
            //assert
            assert.equal(res.json.calledOnce, true);
            assert.deepEqual(res.json.getCall(0).args[0], 409);
            assert.deepEqual(res.json.getCall(0).args[1], {message: 'errorWhenGettingPlayersToSwap'});
        });

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
            var req = {body: {playerInMatch1: {}, playerInMatch2: {}}};
            var res = {json: sinon.spy()};
            //action
            tournamentService.swapPlayers(req, res, {}, {});
            //assert
            assert.equal(res.json.calledOnce, true);
            assert.deepEqual(res.json.getCall(0).args[0], 409);
            assert.deepEqual(res.json.getCall(0).args[1], {message: 'noSwappablePlayersFound'});
        });

        it('should bubble engine errors when swapping', function () {
            //setup
            var tournamentService = new TournamentService();
            tournamentService.getTournamentEngine = function () {
                return {
                    getMatchesToReport: function (bracket, callback) {
                        callback(null, []);
                    }
                };
            };
            var req = {body: {playerInMatch1: {}, playerInMatch2: {}}};
            var res = {json: sinon.spy()};
            //action
            tournamentService.swapPlayers(req, res, {}, {});

            //assert
            assert.equal(res.json.calledOnce, true);
            assert.deepEqual(res.json.getCall(0).args[0], 409);
            assert.deepEqual(res.json.getCall(0).args[1], {message: 'noSwappablePlayersFound'});
        });

        it('should call the engine to swap two players', function () {
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
                        callback(null, {
                            1: {player1: {name: '22'}, player2: {name: '12'}},
                            2: {player1: {name: '21'}, player2: {name: '11'}}
                        });
                    }
                };
            };
            var req = {body: {playerInMatch1: {name: '11'}, playerInMatch2: {name: '22'}}};
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
            var req = {body: {playerInMatch1: {name: '22'}, playerInMatch2: {name: '11'}}};
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
            assert.deepEqual(engine.swapPlayers.getCall(0).args[0], {player1: {name: '21'}, player2: {name: '22'}});
            assert.equal(engine.swapPlayers.getCall(0).args[1], 'player2');
            assert.deepEqual(engine.swapPlayers.getCall(0).args[2], {player1: {name: '11'}, player2: {name: '12'}});
            assert.equal(engine.swapPlayers.getCall(0).args[3], 'player1');
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
            assert.deepEqual(res.json.getCall(0).args[0], 409);
            assert.deepEqual(res.json.getCall(0).args[1], {message: expectedMessage});
        }

        it('should return an error if no players can be found in matches', function () {
            errorReturnTestWhenPlayersToSwapNotProperlyDefined({
                playerInMatch1: {},
                playerInMatch2: {}
            }, 'noSwappablePlayersFound');
        });

        it('should return an error if only player1 can be found in matches', function () {
            errorReturnTestWhenPlayersToSwapNotProperlyDefined({
                playerInMatch1: {name: '11'},
                playerInMatch2: {}
            }, 'noSwappablePlayersFound');
        });

        it('should return an error if only player2 can be found in matches', function () {
            errorReturnTestWhenPlayersToSwapNotProperlyDefined({
                playerInMatch1: {},
                playerInMatch2: {name: '11'}
            }, 'noSwappablePlayersFound');
        });

        it('should return an error if only player1 is not defined at all', function () {
            errorReturnTestWhenPlayersToSwapNotProperlyDefined({playerInMatch2: {name: '11'}}, 'errorWhenGettingPlayersToSwap');
        });

        it('should return an error if only player1 is not defined at all', function () {
            errorReturnTestWhenPlayersToSwapNotProperlyDefined({playerInMatch1: {name: '11'}}, 'errorWhenGettingPlayersToSwap');
        });

        it('should allow to swap players in the same match', function () {
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
                        callback(null, {
                            1: {player1: {name: '12'}, player2: {name: '11'}},
                            2: {player1: {name: '21'}, player2: {name: '22'}}
                        });
                    }
                };
            };
            var req = {body: {playerInMatch1: {name: '11'}, playerInMatch2: {name: '12'}}};
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
                    1: {player1: {name: '12'}, player2: {name: '11'}},
                    2: {player1: {name: '21'}, player2: {name: '22'}}
                }
            });
        });

        it('should bubble the engine error if engine.swapPlayers fails', function () {
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
                        callback({message: 'cantSwapPlayerInMatchThatIsOver'});
                    }
                };
            };
            var req = {body: {playerInMatch1: {name: '11'}, playerInMatch2: {name: '22'}}};
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
            assert.deepEqual(res.json.getCall(0).args[0], 409);
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
            var req = {body: {playerInMatch1: {name: '11'}, playerInMatch2: {name: '22'}}};
            var tournamentModel = {
                update: function (a, b, callback) {
                    callback(true);
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
            assert.deepEqual(res.json.getCall(0).args[0], 500);
            assert.deepEqual(res.json.getCall(0).args[1], {
                error: 'errorReportingMatch',
                message: 'Tournament update failed!'
            });
        });
    });

    describe('getTournamentDataAndSaveTournamentUserAssociation', function(){
        it('should call the nextCallback with an error if tournament lookup fails w/ an error', function(){
            //setup
            var tournamentService = new TournamentService();
            var tournamentModel = {findById:function(query, callback){
               callback(true);
            }};
            var nextCallback = sinon.spy();
            var res = {status:function(){
                var jsonSpy = function(){};
                jsonSpy.json = sinon.spy();
                return jsonSpy;
            }};
            sinon.spy(res, 'status');
            //action
            tournamentService.getTournamentDataAndSaveTournamentUserAssociation(null, res, tournamentModel, null, null, nextCallback);
            //assert
            assert.equal(nextCallback.calledOnce, true);
            assert.equal(res.status.called, false);
        });

        it('should return a 404 response if tournament data cannot be found', function(){
            //setup
            var tournamentService = new TournamentService();
            var tournamentModel = {findById:function(query, callback){
                callback(false, null);
            }};
            var nextCallback = sinon.spy();
            var res = {status:function(){
                var sendSpy = function(){};
                sendSpy.send = sinon.spy();
                return sendSpy;
            }};
            sinon.spy(res, 'status');
            //action
            tournamentService.getTournamentDataAndSaveTournamentUserAssociation(null, res, tournamentModel, null, null, nextCallback);
            //assert
            assert.equal(nextCallback.called, false);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 404);
        });

        it('should only return tournamentData if no session is defined', function(){
            //setup
            var tournamentService = new TournamentService();
            var tournamentModel = {findById:function(query, callback){
                callback(false, {_id:'123'});
            }};
            var tournamentUserModel = {findOne:sinon.spy()};
            var nextCallback = sinon.spy();
            var req = {session:{}};
            var jsonSpy = sinon.spy();
            var res = {status:function(){
                var json = function(){};
                json.json = jsonSpy;
                return json;
            }};
            sinon.spy(res, 'status');
            //action
            tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
            //assert
            assert.equal(nextCallback.called, false);
            assert.equal(tournamentUserModel.findOne.called, false);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 200);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {_id:'123'});
        });

        describe('if session is defined', function(){
            it('should lookup tournamentUser associations if session is defined ', function(){
                var tournamentService = new TournamentService();
                var tournamentModel = {findById:function(query, callback){
                    callback(false, {_id:'tournamentId'});
                }};
                var tournamentUserModel = {findOne:sinon.spy()};
                var nextCallback = sinon.spy();
                var req = {session:{passport:{user:{id:'socialId'}}}};
                var jsonSpy = sinon.spy();
                var res = {status:function(){
                    var json = function(){};
                    json.json = jsonSpy;
                    return json;
                }};
                sinon.spy(res, 'status');
                //action
                tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
                //assert
                assert.equal(nextCallback.called, false);
                assert.equal(tournamentUserModel.findOne.called, true);
                assert.deepEqual(tournamentUserModel.findOne.getCall(0).args[0], {socialId:'socialId', tournamentId:'tournamentId'});
                assert.equal(res.status.calledOnce, true);
                assert.equal(res.status.getCall(0).args[0], 200);
                assert.equal(jsonSpy.calledOnce, true);
                assert.deepEqual(jsonSpy.getCall(0).args[0], {_id:'tournamentId'});
            });

            it('should save new tournamentUser association if session is defined, if association does not exist', function(){
                var tournamentService = new TournamentService();
                var tournamentModel = {findById:function(query, callback){
                    callback(false, {_id:'tournamentId', tournamentName:'tournamentName'});
                }};
                var newTournamentUser = {save:function(){
                    }};
                sinon.spy(newTournamentUser, 'save');
                var tournamentUserModel = function(){
                    return newTournamentUser;
                };
                tournamentUserModel.findOne = function(params, callback){
                    callback(false, null);
                };

                var nextCallback = sinon.spy();
                var req = {session:{passport:{user:{id:'socialId'}}}};
                var jsonSpy = sinon.spy();
                var res = {status:function(){
                    var json = function(){};
                    json.json = jsonSpy;
                    return json;
                }};
                sinon.spy(res, 'status');
                //action
                tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
                //assert
                assert.equal(nextCallback.called, false);
                assert.equal(res.status.calledOnce, true);
                assert.equal(res.status.getCall(0).args[0], 200);
                assert.equal(jsonSpy.calledOnce, true);
                assert.deepEqual(jsonSpy.getCall(0).args[0], {_id:'tournamentId', tournamentName:'tournamentName'});
                assert.equal(newTournamentUser.save.calledOnce, true);
                assert.equal(newTournamentUser.socialId, 'socialId');
                assert.equal(newTournamentUser.name, 'tournamentName');
                assert.equal(newTournamentUser.tournamentId, 'tournamentId');
                assert.equal(newTournamentUser.creator, false);
                assert.equal(newTournamentUser.admin, true);
            });

            it('should save new tournamentUser association if session is defined, if association does not exist', function(){
                var tournamentService = new TournamentService();
                var tournamentModel = {findById:function(query, callback){
                    callback(false, {_id:'tournamentId', tournamentName:'tournamentName'});
                }};
                var newTournamentUser = {save:function(){
                }};
                sinon.spy(newTournamentUser, 'save');
                var tournamentUserModel = function(){
                    return newTournamentUser;
                };
                tournamentUserModel.findOne = function(params, callback){
                    callback(false, {socialId:'socialId'});
                };

                var nextCallback = sinon.spy();
                var req = {session:{passport:{user:{id:'socialId'}}}};
                var jsonSpy = sinon.spy();
                var res = {status:function(){
                    var json = function(){};
                    json.json = jsonSpy;
                    return json;
                }};
                sinon.spy(res, 'status');
                //action
                tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
                //assert
                assert.equal(nextCallback.called, false);
                assert.equal(res.status.calledOnce, true);
                assert.equal(res.status.getCall(0).args[0], 200);
                assert.equal(jsonSpy.calledOnce, true);
                assert.deepEqual(jsonSpy.getCall(0).args[0], {_id:'tournamentId', tournamentName:'tournamentName'});
                assert.equal(newTournamentUser.save.called, false);
            });
        });
    });
});