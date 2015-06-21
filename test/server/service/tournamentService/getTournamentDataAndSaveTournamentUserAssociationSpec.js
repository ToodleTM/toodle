'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;


describe('TournamentService - User and tournament linking', function () {
    it('should call the nextCallback with an error if tournament lookup fails w/ an error', function () {
        //setup
        var tournamentService = new TournamentService();
        var tournamentModel = {
            findById: function (query, callback) {
                callback(true);
            }
        };
        var nextCallback = sinon.spy();
        var res = {
            status: function () {
                var jsonSpy = function () {
                };
                jsonSpy.json = sinon.spy();
                return jsonSpy;
            }
        };
        sinon.spy(res, 'status');
        //action
        tournamentService.getTournamentDataAndSaveTournamentUserAssociation(null, res, tournamentModel, null, null, nextCallback);
        //assert
        assert.equal(nextCallback.calledOnce, true);
        assert.equal(res.status.called, false);
    });

    it('should return a 404 response if tournament data cannot be found', function () {
        //setup
        var tournamentService = new TournamentService();
        var tournamentModel = {
            findById: function (query, callback) {
                callback(false, null);
            }
        };
        var nextCallback = sinon.spy();
        var res = {
            status: function () {
                var sendSpy = function () {
                };
                sendSpy.send = sinon.spy();
                return sendSpy;
            }
        };
        sinon.spy(res, 'status');
        //action
        tournamentService.getTournamentDataAndSaveTournamentUserAssociation(null, res, tournamentModel, null, null, nextCallback);
        //assert
        assert.equal(nextCallback.called, false);
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 404);
    });

    it('should only return tournamentData if no session is defined', function () {
        //setup
        var tournamentService = new TournamentService();
        var tournamentModel = {
            findById: function (query, callback) {
                callback(false, {_id: '123'});
            }
        };
        var tournamentUserModel = {findOne: sinon.spy()};
        var nextCallback = sinon.spy();
        var req = {session: {}};
        var jsonSpy = sinon.spy();
        var res = {
            status: function () {
                var json = function () {
                };
                json.json = jsonSpy;
                return json;
            }
        };
        sinon.spy(res, 'status');
        //action
        tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
        //assert
        assert.equal(nextCallback.called, false);
        assert.equal(tournamentUserModel.findOne.called, false);
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(jsonSpy.calledOnce, true);
        assert.deepEqual(jsonSpy.getCall(0).args[0], {_id: '123'});
    });

    describe('if session is defined', function () {
        it('should lookup tournamentUser associations if session is defined ', function () {
            var tournamentService = new TournamentService();
            var tournamentModel = {
                findById: function (query, callback) {
                    callback(false, {_id: 'tournamentId'});
                }
            };
            var tournamentUserModel = {findOne: sinon.spy()};
            var nextCallback = sinon.spy();
            var req = {session: {passport: {user: {id: 'socialId'}}}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var json = function () {
                    };
                    json.json = jsonSpy;
                    return json;
                }
            };
            sinon.spy(res, 'status');
            //action
            tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
            //assert
            assert.equal(nextCallback.called, false);
            assert.equal(tournamentUserModel.findOne.called, true);
            assert.deepEqual(tournamentUserModel.findOne.getCall(0).args[0], {
                socialId: 'socialId',
                tournamentId: 'tournamentId'
            });
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 200);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {_id: 'tournamentId'});
        });

        it('should save new tournamentUser association if session is defined, if association does not exist', function () {
            var tournamentService = new TournamentService();
            var tournamentModel = {
                findById: function (query, callback) {
                    callback(false, {_id: 'tournamentId', tournamentName: 'tournamentName'});
                }
            };
            var newTournamentUser = {
                save: function () {
                }
            };
            sinon.spy(newTournamentUser, 'save');
            var tournamentUserModel = function () {
                return newTournamentUser;
            };
            tournamentUserModel.findOne = function (params, callback) {
                callback(false, null);
            };

            var nextCallback = sinon.spy();
            var req = {session: {passport: {user: {id: 'socialId'}}}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var json = function () {
                    };
                    json.json = jsonSpy;
                    return json;
                }
            };
            sinon.spy(res, 'status');
            //action
            tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
            //assert
            assert.equal(nextCallback.called, false);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 200);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {_id: 'tournamentId', tournamentName: 'tournamentName'});
            assert.equal(newTournamentUser.save.calledOnce, true);
            assert.equal(newTournamentUser.socialId, 'socialId');
            assert.equal(newTournamentUser.name, 'tournamentName');
            assert.equal(newTournamentUser.tournamentId, 'tournamentId');
            assert.equal(newTournamentUser.creator, false);
            assert.equal(newTournamentUser.admin, true);
        });

        it('should save new tournamentUser association if session is defined, if association does not exist', function () {
            var tournamentService = new TournamentService();
            var tournamentModel = {
                findById: function (query, callback) {
                    callback(false, {_id: 'tournamentId', tournamentName: 'tournamentName'});
                }
            };
            var newTournamentUser = {
                save: function () {
                }
            };
            sinon.spy(newTournamentUser, 'save');
            var tournamentUserModel = function () {
                return newTournamentUser;
            };
            tournamentUserModel.findOne = function (params, callback) {
                callback(false, {socialId: 'socialId'});
            };

            var nextCallback = sinon.spy();
            var req = {session: {passport: {user: {id: 'socialId'}}}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var json = function () {
                    };
                    json.json = jsonSpy;
                    return json;
                }
            };
            sinon.spy(res, 'status');
            //action
            tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, tournamentModel, tournamentUserModel, null, nextCallback);
            //assert
            assert.equal(nextCallback.called, false);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 200);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {_id: 'tournamentId', tournamentName: 'tournamentName'});
            assert.equal(newTournamentUser.save.called, false);
        });
    });
});