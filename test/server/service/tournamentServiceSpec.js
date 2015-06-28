'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../lib/service/tournamentService').TournamentService;

describe('TournamentService - General purpose stuff', function () {

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
        assert.equal(res.json.getCall(0).args[0], 400);
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
        assert.equal(res.json.getCall(0).args[0], 400);
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
        assert.equal(res.json.getCall(0).args[0], 400);
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
        assert.deepEqual(res.json.getCall(0).args[0], 400);
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
        assert.equal(res.json.getCall(0).args[0], 400);
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
        assert.deepEqual(res.json.getCall(0).args[0], 400);
        assert.deepEqual(res.json.getCall(0).args[1].message, 'some error from the engine');
    });
});