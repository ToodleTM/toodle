'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var tournamentControllerUtils = new (require('../../../lib/utils/tournamentControllerUtils'))();
var serverUtils = new (require('../../../lib/utils/serverUtils'))();


var VALID_TOURNAMENT_ID = '5452d71103aec670587bea44';
describe('TournamentControllerUtils', function () {
    var tournamentModel = {
        findById: function () {
        }
    };
    beforeEach(function () {
        tournamentModel.findOne = function () {
        };
        sinon.spy(serverUtils, 'isThisTournamentIdValid');
        sinon.spy(tournamentModel, 'findOne');
        sinon.spy(tournamentModel, 'findById');
    });
    afterEach(function () {
        serverUtils.isThisTournamentIdValid.restore();
        tournamentModel.findOne.restore();
        tournamentModel.findById.restore();
    });
    describe('Reporting helper', function () {
        it('should allow tournamentID to be used for reporting a match', function () {
            //setup
            var req = {body: {tournamentId: VALID_TOURNAMENT_ID}};
            //action
            tournamentControllerUtils.reportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.calledOnce, true);
            assert.equal(tournamentModel.findById.calledOnce, true);
            assert.equal(tournamentModel.findOne.called, false);
        });

        it('should return a 404 if tournamentId is given but not valid', function () {
            //setup
            var req = {body: {tournamentId: '5452d71103aec67'}};
            var jsonSpy = sinon.spy();
            var res = {
                status:function(){
                    var status = function(){};
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
            //action
            tournamentControllerUtils.reportMatchHelper(req, res, serverUtils, null, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.calledOnce, true);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 404);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {message:'notFound'});
        });

        it('should allow signupID to be used for reporting a match', function () {
            //setup
            var req = {body: {signupID: 'asdfasfdasdf5452d71103aec670587bea44'}};
            //action
            tournamentControllerUtils.reportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(tournamentModel.findOne.calledOnce, true);
        });

        it('should return a 404 if neither tournamentId or signupID were used to report a match', function () {
            //setup
            var req = {body: {}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var status = function () {
                    };
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
            //action
            tournamentControllerUtils.reportMatchHelper(req, res, serverUtils, null, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.calledOnce, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(tournamentModel.findOne.called, false);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 404);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {message: 'notFound'});
        });

        it('should not allow reporting through the signupID if tournament has userPrivileges of 1', function () {
            //setup
            var req = {body: {signupID: 'asdfasfdasdf5452d71103aec670587bea44'}};
            tournamentModel.findOne = function (params, callback) {
                callback(null, {userPrivileges: 1});
            };
            sinon.spy(tournamentModel, 'findOne');
            var tournamentService = {
                reportMatch: sinon.spy()
            };
            var res = {json: sinon.spy()};
            //action
            tournamentControllerUtils.reportMatchHelper(req, res, serverUtils, tournamentModel, tournamentService);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(tournamentService.reportMatch.called, false);
            assert.equal(res.json.calledOnce, true);
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'insufficientPrivileges');
        });

        it('should allow reporting through the signupID if tournament has userPrivileges superior to 1', function () {
            //setup
            var req = {body: {signupID: 'asdfasfdasdf5452d71103aec670587bea44'}};
            tournamentModel.findOne = function (params, callback) {
                callback(null, {userPrivileges: 2});
            };
            sinon.spy(tournamentModel, 'findOne');
            var tournamentService = {
                reportMatch: sinon.spy()
            };
            //action
            tournamentControllerUtils.reportMatchHelper(req, null, serverUtils, tournamentModel, tournamentService);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(tournamentService.reportMatch.calledOnce, true);
        });

    });

    describe('Unreporting Helper', function () {
        it('should accept tournamentID as a tournament identifier to unreport a tournament', function () {
            //setup
            var req = {body: {tournamentId: VALID_TOURNAMENT_ID}};
            //action
            tournamentControllerUtils.unreportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.findOne.called, false);
            assert.equal(tournamentModel.findById.calledOnce, true);
        });

        it('should return a 404 if tournamentId is present but invalid', function () {
            //setup
            var req = {body: {tournamentId: '5452d71103a7bea44'}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var status = function () {
                    };
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
            //action
            tournamentControllerUtils.unreportMatchHelper(req, res, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.findOne.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 404);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {message: 'notFound'});
        });

        it('should accept signupID as a tournament identifier to unreport a tournament', function () {
            //setup
            var req = {body: {signupID: '5452d71103aec670587bea44'}};
            //action
            tournamentControllerUtils.unreportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.findOne.calledOnce, true);
            assert.equal(tournamentModel.findById.calledOnce, false);
        });

        it('should return a 404 if neither tournamentId nor signupID are provided', function () {
            //setup
            var req = {body: {}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var status = function () {
                    };
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
            //action
            tournamentControllerUtils.unreportMatchHelper(req, res, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.findOne.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 404);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {message: 'notFound'});
        });

        it('should not allow unreporting with a signupID for user privileges inferior to 3', function () {
            //setup
            var req = {body: {signupID: '5452d71103aec670587bea44'}};
            tournamentModel.findOne = function (params, callback) {
                callback(null, [{userPrivileges: 1}]);
            };
            sinon.spy(tournamentModel, 'findOne');
            var tournamentService = {
                unreportMatch: sinon.spy()
            };
            var res = {json: sinon.spy()};
            //action
            tournamentControllerUtils.unreportMatchHelper(req, res, serverUtils, tournamentModel, tournamentService);
            //assert
            assert.equal(tournamentModel.findOne.calledOnce, true);
            assert.equal(tournamentModel.findById.calledOnce, false);
            assert.equal(tournamentService.unreportMatch.called, false);
            assert.equal(res.json.calledOnce, true);
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'insufficientPrivileges');
        });
    });

    describe('Update helper', function () {
        var tournamentService = {
            updateTournament: function () {
            }
        };

        beforeEach(function () {
            sinon.spy(tournamentService, 'updateTournament');
        });
        afterEach(function () {
            tournamentService.updateTournament.restore();
        });

        it('should not allow changing the engine value if tournament has already begun', function () {
            //setup
            var newData = {_id: VALID_TOURNAMENT_ID, engine: 'Some Engine'};
            tournamentModel.findById = function (id, callback) {
                callback(null, {engine: 'some other engine', running: true});
            };
            sinon.spy(tournamentModel, 'findById');
            var res = {json: sinon.spy()};
            var serverUtils = {
                isThisTournamentIdValid: function () {
                    return true;
                }
            };
            //action
            tournamentControllerUtils.updateTournament(null, res, serverUtils, tournamentModel, tournamentService, newData, null);
            //assert
            assert.equal(res.json.calledOnce, true);
            assert.equal(res.json.getCall(0).args[0], 400);
            assert.equal(res.json.getCall(0).args[1].message, 'cantUpdateEngineWhileRunning');
            assert.equal(tournamentService.updateTournament.called, false);
        });

        it('should return a 404 if tournament id is not valid', function () {
            //setup
            var newData = {_id: 'not a valid ID', engine: 'Some Engine'};
            var jsonSpy = sinon.spy();
            var res = {status: function(){
                var status = function(){};
                status.json = jsonSpy;
                return status;
            }};
            sinon.spy(res, 'status');
            var serverUtils = {
                isThisTournamentIdValid: function () {
                    return false;
                }
            };
            //action
            tournamentControllerUtils.updateTournament(null, res, serverUtils, tournamentModel, tournamentService, newData, null);
            //assert
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 404);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args[0], {message:'notFound'});
            assert.equal(tournamentService.updateTournament.called, false);
        });

        it('should update call the updateTournament function if we re not trying to change the engine of a running tournament', function () {
            //setup
            var newData = {_id: VALID_TOURNAMENT_ID, engine: 'Some Engine'};
            tournamentModel.findById = function (id, callback) {
                callback(null, {engine: 'Some Engine', running: true});
            };
            sinon.spy(tournamentModel, 'findById');
            var res = {json: sinon.spy()};
            var serverUtils = {
                isThisTournamentIdValid: function () {
                    return true;
                }
            };
            //action
            tournamentControllerUtils.updateTournament(null, res, serverUtils, tournamentModel, tournamentService, newData, null);
            //assert
            assert.equal(res.json.called, false);
            assert.equal(tournamentService.updateTournament.calledOnce, true);
        });

        //verif changement d'engine quand le tournoi est pas running
        it('should allow engine changes when tournament is NOT running', function(){
            //setup
            var newData = {_id: VALID_TOURNAMENT_ID, engine: 'Some Engine'};
            tournamentModel.findById = function (id, callback) {
                callback(null, {engine: 'a different engine', running: false});
            };
            sinon.spy(tournamentModel, 'findById');
            var res = {json: sinon.spy()};
            var serverUtils = {
                isThisTournamentIdValid: function () {
                    return true;
                }
            };
            //action
            tournamentControllerUtils.updateTournament(null, res, serverUtils, tournamentModel, tournamentService, newData, null);
            //assert
            assert.equal(res.json.called, false);
            assert.equal(tournamentService.updateTournament.calledOnce, true);
        });
    });

    describe('modifications forbidden when tournament has a follow-up', function () {
        var publicFunctionsToTest = ['reportMatchHelper', 'unreportMatchHelper'];
        var adminFunctionsToTest = ['updateTournament', 'forfeitMatchHelper'].concat(publicFunctionsToTest);

        adminFunctionsToTest.forEach(function(functionToTest){
            it('should return an error if the '+functionToTest+' service is called from the admin page', function () {
                //setup
                var jsonSpy = sinon.spy();
                var res = {
                    status: function () {
                        var statusFunction = function () {
                        };
                        statusFunction.json = jsonSpy;
                        return statusFunction;
                    }
                };
                var tournamentMock = {
                    findById: function (criteria, callback) {
                        callback(null, {followingTournament: 'followingTournamentId'});
                    }
                };
                var serverUtilsMock = {
                    isThisTournamentIdValid: function () {
                        return true;
                    }
                };
                sinon.spy(res, 'status');
                //action
                tournamentControllerUtils[functionToTest]({body: {tournamentId:'1234'}}, res, serverUtilsMock, tournamentMock, null, {}, null);
                //assert
                assert.equal(res.status.calledOnce, true);
                assert.deepEqual(res.status.getCall(0).args, [400]);
                assert.equal(jsonSpy.calledOnce, true);
                assert.deepEqual(jsonSpy.getCall(0).args, [{message: 'tournamentLocked'}]);
            });
        });

        publicFunctionsToTest.forEach(function (functionToTest) {
            it('should return an error if the ' + functionToTest + ' service is called from the admin page', function () {
                //setup
                var jsonSpy = sinon.spy();
                var res = {
                    status: function () {
                        var statusFunction = function () {
                        };
                        statusFunction.json = jsonSpy;
                        return statusFunction;
                    }
                };
                var tournamentMock = {
                    findById: function (criteria, callback) {
                        callback(null, {followingTournament: 'followingTournamentId', userPrivileges:2});
                    }
                };
                tournamentMock.findOne = tournamentMock.findById;
                var serverUtilsMock = {
                    isThisTournamentIdValid: function () {
                        return true;
                    }
                };
                sinon.spy(res, 'status');
                //action
                tournamentControllerUtils[functionToTest]({body: {signupID: '1234'}}, res, serverUtilsMock, tournamentMock, null, {}, null);
                //assert
                assert.equal(res.status.calledOnce, true);
                assert.deepEqual(res.status.getCall(0).args, [400]);
                assert.equal(jsonSpy.calledOnce, true);
                assert.deepEqual(jsonSpy.getCall(0).args, [{message: 'tournamentLocked'}]);
            });
        });
    });
});