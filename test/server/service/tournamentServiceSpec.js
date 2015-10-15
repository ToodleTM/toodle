'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../lib/service/tournamentService').TournamentService;

describe('TournamentService - General purpose stuff', function () {
    var tournamentService = {};
    beforeEach(function () {
        tournamentService = new TournamentService();
    });
    it('should return an error if save fails', function () {
        //setup
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
        assert.deepEqual(res.json.getCall(0).args[0].adminURL, 'tid');
        assert.deepEqual(res.json.getCall(0).args[0].signupURL, 'sid');
        tournamentService.utils().createTournamentId = originalCreateTournamentId;
    });

    it('should save tournament parent/following if there was a "tournamentParent" attribute in submitted data', function () {
        //setup
        var req = {body: {parentTournament: '1234'}}, newTournament = {
            _id: '1235', save: function () {
            }
        };
        var tournamentModel = {update: sinon.spy()};
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        var utilsMock = {
            createTournamentId: function () {
                return '1236';
            }
        };
        sinon.stub(tournamentService, 'utils').returns(utilsMock);
        //action
        tournamentService.saveTournament(req, null, newTournament, null);
        //assert
        assert.equal(newTournament.parentTournament, '1234');
        assert.equal(tournamentModel.update.calledOnce, true);
        assert.deepEqual(tournamentModel.update.getCall(0).args[0], {_id: '1234', followingTournament:null});
        assert.deepEqual(tournamentModel.update.getCall(0).args[1], {
            followingTournament: '1235',
            followingTournamentPublicId: '1236'
        });
        assert.deepEqual(tournamentModel.update.getCall(0).args[2], {upsert: true});
    });

    it('should not trigger a save and return an error if parent update failed (parentTournament is set)', function () {
        //setup
        var req = {body: {parentTournament: '1234'}}, newTournament = {
            _id: '1235', save: sinon.spy()
        };
        var res = {json: sinon.spy()};
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback({error: 'updateError'});
            }
        };
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        //action
        tournamentService.saveTournament(req, res, newTournament, null);
        //assert
        assert.equal(newTournament.save.called, false);
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args, [500, {
            error: 'updateFailed',
            message: 'CouldNotUpdateParentTournament'
        }]);
    });

    it('should trigger a save if parent update is OK (parentTournament is set)', function () {
        //setup
        var req = {body: {parentTournament: '1234'}}, newTournament = {
            _id: '1235', save: sinon.spy()
        };
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback(null, {});
            },
            findById: function (criteria, projection, callback) {
                callback(null, {});
            }
        };
        var mockEngine = {
            winners: function (tournament, callback) {
                callback(null, [{name: 'john'}, {name: 'jane'}]);
            }
        };
        tournamentService.getTournamentEngine = sinon.stub().returns(mockEngine);
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        //action
        tournamentService.saveTournament(req, null, newTournament, null);
        //assert
        assert.equal(newTournament.save.calledOnce, true);
    });

    it('should keep the engine name if it is defined in the post body', function () {
        //setup
        var req = {body: {parentTournament: '1234', engine: 'someEngine'}}, newTournament = {
            _id: '1235', save: sinon.spy()
        };
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback(null, {});
            },
            findById: function (criteria, projection, callback) {
                callback(null, {});
            }
        };
        var mockEngine = {
            winners: function (tournament, callback) {
                callback(null, [{name: 'john'}, {name: 'jane'}]);
            }
        };
        tournamentService.getTournamentEngine = sinon.stub().returns(mockEngine);
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        //action
        tournamentService.saveTournament(req, null, newTournament, null);
        //assert
        assert.equal(newTournament.engine, 'someEngine');
    });

    it('should return an error if engine could not be loaded', function () {
        //setup
        var req = {body: {parentTournament: '1234', engine: 'someEngine'}}, newTournament = {
            _id: '1235', save: sinon.spy()
        };
        var res = {json: sinon.spy()};
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback(null, {});
            },
            findById: function (criteria, projection, callback) {
                callback(null, {});
            }
        };
        tournamentService.getTournamentEngine = sinon.stub().returns(null);
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        //action
        tournamentService.saveTournament(req, res, newTournament, null);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args, [500, {
            error: 'creationFailed',
            message: 'CouldNotUpdateNewTournament'
        }]);
    });

    it('should return an error if parent tournament already has a follow-up tournament', function () {
        //setup
        var req = {body: {parentTournament: '1234', engine: 'someEngine'}}, newTournament = {
            _id: '1235', save: function (callback) {
                callback(null);
            }
        };
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback({code: 11000}, {});
            }
        };
        var mockEngine = {
            winners: function (tournament, callback) {
                callback(null, []);
            }
        };
        var res = {json: sinon.spy()};
        tournamentService.getTournamentEngine = sinon.stub().returns(mockEngine);
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        sinon.spy(tournamentService, 'getTournament');
        sinon.spy(mockEngine, 'winners');
        //action
        tournamentService.saveTournament(req, res, newTournament, null);
        //assert
        assert.equal(tournamentService.getTournament.calledOnce, true);
        assert.equal(mockEngine.winners.called, false);
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args, [400, {
            error: 'creationFailed',
            message: 'ParentTournamentAlreadyHasAFollowingTournament'
        }]);
    });

    it('should return an error if parent tournament engine can\'t get a winners list (tournament is most likely not over yet)', function () {
        //setup
        var req = {body: {parentTournament: '1234', engine: 'someEngine'}}, newTournament = {
            _id: '1235', save: function (callback) {
                callback(null);
            }
        };
        var parentTournament = {};
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback(null, {});
            },
            findById: function (criteria, projection, callback) {
                callback(null, parentTournament);
            }
        };
        sinon.spy(tournamentModel, 'findById');
        var mockEngine = {
            winners: function (tournament, callback) {
                callback(null, []);
            }
        };
        var res = {json: sinon.spy()};
        tournamentService.getTournamentEngine = sinon.stub().returns(mockEngine);
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        sinon.spy(tournamentService, 'getTournament');
        sinon.spy(mockEngine, 'winners');
        //action
        tournamentService.saveTournament(req, res, newTournament, null);
        //assert
        assert.equal(tournamentService.getTournament.calledTwice, true);
        assert.equal(tournamentModel.findById.calledOnce, true);
        assert.equal(mockEngine.winners.calledOnce, true);
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args, [400, {
            error: 'creationFailed',
            message: 'ParentTournamentIsNotOverYet'
        }]);
    });

    it('should seed winners from parent tournament into new tournament', function () {
        //setup
        var req = {body: {parentTournament: '1234', engine: 'someEngine'}}, newTournament = {
            _id: '1235', save: function (callback) {
                callback(null);
            }
        };
        var parentTournament = {};
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback(null, {});
            },
            findById: function (criteria, projection, callback) {
                callback(null, parentTournament);
            }
        };
        sinon.spy(tournamentModel, 'findById');
        var mockEngine = {
            winners: function (tournament, callback) {
                callback(null, [{name: 'john'}, {name: 'jane'}]);
            }
        };
        var res = {json: sinon.spy()};
        tournamentService.getTournamentEngine = sinon.stub().returns(mockEngine);
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        sinon.spy(tournamentService, 'getTournament');
        sinon.spy(mockEngine, 'winners');
        //action
        tournamentService.saveTournament(req, res, newTournament, null);
        //assert
        assert.equal(tournamentService.getTournament.calledTwice, true);
        assert.equal(tournamentModel.findById.calledOnce, true);
        assert.equal(mockEngine.winners.calledOnce, true);
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0].players, [{name: 'john'}, {name: 'jane'}]);
    });

    it('should update current tournament to set its public parent URL if tournament created is a "follow up tournament"', function () {
        //setup
        var req = {body: {parentTournament: '1234', engine: 'someEngine'}}, newTournament = {
            _id: '1235', save: function (callback) {
                callback(null);
            }
        };
        var parentTournament = {signupID: '1233'};
        var tournamentModel = {
            update: function (id, fields, options, callback) {
                callback(null, {});
            },
            findById: function (criteria, projection, callback) {
                callback(null, parentTournament);
            }
        };
        sinon.spy(tournamentModel, 'findById');
        var mockEngine = {
            winners: function (tournament, callback) {
                callback(null, [{name: 'john'}, {name: 'jane'}]);
            }
        };
        var res = {json: sinon.spy()};
        tournamentService.getTournamentEngine = sinon.stub().returns(mockEngine);
        tournamentService.getTournament = function () {
            return tournamentModel;
        };
        sinon.spy(tournamentService, 'getTournament');
        sinon.spy(mockEngine, 'winners');
        sinon.spy(tournamentService, 'updateTournamentAndTournamentUser');
        //action
        tournamentService.saveTournament(req, res, newTournament, null);
        //assert
        assert.deepEqual(tournamentService.updateTournamentAndTournamentUser.calledOnce, true);
        assert.deepEqual(tournamentService.updateTournamentAndTournamentUser.getCall(0).args[0].parentTournamentPublicId, '1233');
    });

    it('should return admin and user URLs if save succeeds', function () {
        //setup
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

    it('should unlock tournament registrations if tournament is stopped', function () {
        //setup
        var tournament = {running: true, locked: true, save: sinon.spy()};
        sinon.spy(tournamentService, 'updateTournament');
        //action
        tournamentService.stopTournament(null, null, tournament, function () {
        });
        //assert
        assert.equal(tournamentService.updateTournament.calledOnce, true);
        assert.equal(tournamentService.updateTournament.getCall(0).args[2].locked, false);
    });

    it('should lock tournament registrations if tournament is started', function () {
        //setup
        sinon.stub(tournamentService, 'getTournamentEngine').returns({
            initBracket: function (playersList, callback) {
                callback(null, {});
            }
        });
        var tournament = {
            players: [1],
            engine: 'foobar',
            userPrivileges: 1,
            running: false,
            locked: false,
            save: sinon.spy()
        };
        sinon.spy(tournamentService, 'updateTournament');
        //action
        tournamentService.startTournament(null, {json: sinon.spy()}, tournament);
        //assert
        assert.equal(tournamentService.updateTournament.calledOnce, true);
        assert.equal(tournamentService.updateTournament.getCall(0).args[2].locked, true);
    });
});