'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;

describe('TournamentService - Tournament Creation', function () {
    describe('Tournament Start', function () {
        it('should use a tournament engine to create tournament bracket and return the created bracket', function () {
            //setup
            var tournamentService = new TournamentService();
            var mockEngine = {
                initBracket: function (players, callback) {
                    callback(null, {init: true});
                }
            };
            var mockEngineSpy = sinon.spy(mockEngine, 'initBracket');
            var getTournamentEngineStub = sinon.stub().returns(mockEngine);
            tournamentService.getTournamentEngine = getTournamentEngineStub;
            var tournament = {
                userPrivileges:1,
                engine: 'tournamentEngine', players: [
                    {name: 'john'},
                    {name: 'mary'}
                ], save: function () {
                    return res.json({init: true});
                }
            };
            tournamentService.updateTournament = function (req, res, tournament, callback) {
                callback(null, tournament);
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(getTournamentEngineStub.called, true);
            assert.equal(getTournamentEngineStub.getCall(0).args[0], 'tournamentEngine');
            assert.equal(mockEngineSpy.getCall(0).args[0][0].name, 'john');
            assert.equal(mockEngineSpy.getCall(0).args[0][1].name, 'mary');
            assert.equal(res.json.getCall(0).args[0].bracket.init, true);
            assert.equal(res.json.calledOnce, true);
        });

        it('should be able to detect tournament engine errors @ init', function () {
            //setup
            var tournamentService = new TournamentService();
            var mockEngine = {
                initBracket: function (players, callback) {
                    callback({message: 'thisIsAnError'}, null);
                }
            };
            var getTournamentEngineStub = sinon.stub().returns(mockEngine);
            tournamentService.getTournamentEngine = getTournamentEngineStub;
            var tournament = {
                userPrivileges:1,
                engine: 'tournamentEngine', players: [
                    {name: 'john'},
                    {name: 'mary'}
                ], save: function () {
                }
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'thisIsAnError');
            assert.equal(res.json.calledOnce, true);
        });

        it('should reject tournament start request if no engine is specified', function () {
            //setup
            var tournamentService = new TournamentService();
            var tournament = {
                engine: null, players: [
                    {name: 'john'}
                ]
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'noEngineSpecified');
            assert.equal(res.json.calledOnce, true);
        });

        it('should reject tournament start request if no engine is specified', function () {
            //setup
            var tournamentService = new TournamentService();
            var tournament = {
                engine: 'none', players: [
                    {name: 'john'}
                ]
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'noEngineSpecified');
            assert.equal(res.json.calledOnce, true);
        });

        it('should save tournament bracket if bracket creation succeeds', function () {
            //setup
            var tournamentService = new TournamentService();
            var mockEngine = {
                initBracket: function (players, callback) {
                    callback(null, {init: true});
                }
            };
            sinon.spy(mockEngine, 'initBracket');
            var getTournamentEngineStub = sinon.stub().returns(mockEngine);
            tournamentService.getTournamentEngine = getTournamentEngineStub;
            var tournament = {
                userPrivileges:1,
                engine: 'tournamentEngine', players: [
                    {name: 'john'},
                    {name: 'mary'}
                ], save: function () {
                }
            };
            var res = {
                json: function () {
                }
            };
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
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'tournamentAlreadyRunning');
            assert.equal(res.json.calledOnce, true);
        });

        it('Should not be able to start a tournament with no players', function () {
            //setup
            var tournamentService = new TournamentService();
            var tournament = {};
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'noPlayers');
            assert.equal(res.json.calledOnce, true);
        });

        it('should return an error if no matching tournament engine is found', function () {
            //setup
            var tournamentService = new TournamentService();
            var tournament = {
                userPrivileges:1,
                players: [
                    {name: 'bob'}
                ], engine: 'some engine'
            };
            var res = {
                json: function () {
                }
            };
            tournamentService.getTournamentEngine = function () {
                return null;
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'invalidTournamentEngine');
            assert.equal(res.json.calledOnce, true);
        });

        it('should return an error if no userPrivileges are set when starting the tournament', function () {
            //setup
            var tournamentService = new TournamentService();
            var tournament = {
                players: [
                    {name: 'bob'}
                ], engine: 'some engine'
            };
            var res = {
                json: function () {
                }
            };
            var mockEngine = {
                initBracket: function (players, callback) {
                    callback(null, {init: true});
                }
            };
            sinon.spy(mockEngine, 'initBracket');
            var getTournamentEngineStub = sinon.stub().returns(mockEngine);
            tournamentService.getTournamentEngine = getTournamentEngineStub;
            sinon.spy(res, 'json');
            //action
            tournamentService.startTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'userPrivilegesMustBeSpecified');
        });
    });
    describe('Tournament Stop', function () {
        it('should be able to stop the tournament if it s running', function () {
            //setup
            var tournamentService = new TournamentService();
            var tournament = {
                running: true, save: function (callback) {
                    callback(null);
                }
            };
            var res = {
                json: function () {
                }
            };
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
            assert.equal(res.json.calledOnce, true);
        });
        it('should not allow stopping a not running tournament', function () {
            //setup
            var tournamentService = new TournamentService();
            var tournament = {
                running: false, save: function (callback) {
                    callback(null);
                }
            };
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            tournamentService.stopTournament({}, res, tournament);
            //assert
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'tournamentAlreadyStopped');
            assert.equal(res.json.calledOnce, true);
        });
    });
});