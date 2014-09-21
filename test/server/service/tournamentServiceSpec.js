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
                assert.equal(res.json.getCall(0).args[0], 500);
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

        it('should not allow registration of the same player twice', function () {
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

        it('should not allow registration of the same player twice (use of caps)', function () {
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

        it('should allow player add when using the admin id if tournament is locked', function () {
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
        describe('Match reporting / unreporting', function () {
            it('should return an empty array if there s nothing to return and the call is ok', function () {
                //setup
                var tournamentService = new TournamentService();
                tournamentService.getTournamentEngine = function(){
                    return {
                        initBracket:function(){
                            return {}
                        },
                        getMatchesToReport:function(bracket, callback){
                            callback(false, []);
                        }
                    }
                };
                var res = {
                    json:function(){}
                };
                sinon.spy(res, 'json');
                //action
                tournamentService.getMatchesToReport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
            });

            it('should return an error if engine call failed for some reason', function(){
                //setup
                var tournamentService = new TournamentService();
                tournamentService.getTournamentEngine = function(){
                    return {
                        initBracket:function(){
                            return {}
                        },
                        getMatchesToReport:function(bracket, callback){
                            callback(true, null);
                        }
                    }
                };
                var res = {
                    json:function(){}
                };
                sinon.spy(res, 'json');
                //action
                tournamentService.getMatchesToReport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
            });

            it('should correctly handle an uncatched exception', function(){
                //setup
                var tournamentService = new TournamentService();
                tournamentService.getTournamentEngine = function(){
                    return {
                        initBracket:function(){
                            return {}
                        },
                        getMatchesToReport:function(bracket, callback){
                            throw new Error('this is an uncatched exception');
                        }
                    }
                };
                var res = {
                    json:function(){}
                };
                sinon.spy(res, 'json');
                //action
                tournamentService.getMatchesToReport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
            });
        });
    });
});