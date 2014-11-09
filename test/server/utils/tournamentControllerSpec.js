var assert = require('chai').assert;
var sinon = require('sinon');
var tournamentControllerUtils = new (require('../../../lib/utils/tournamentControllerUtils'))();
var serverUtils = new (require('../../../lib/utils/serverUtils'))();

describe('TournamentControllerUtils', function () {
    var tournamentModel = {
        findById: function () {
        },
        find: function () {
        }
    };
    beforeEach(function () {
        sinon.spy(serverUtils, 'isThisTournamentIdValid');
        sinon.spy(tournamentModel, 'find');
        sinon.spy(tournamentModel, 'findById');
    });
    afterEach(function () {
        serverUtils.isThisTournamentIdValid.restore();
        tournamentModel.find.restore();
        tournamentModel.findById.restore();
    });
    describe('Reporting helper', function () {
        it('should allow tournamentID to be used for reporting a match', function () {
            //setup
            var req = {body: {tournamentId: '5452d71103aec670587bea44'}};
            //action
            tournamentControllerUtils.reportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.calledOnce, true);
            assert.equal(tournamentModel.findById.calledOnce, true);
            assert.equal(tournamentModel.find.called, false);
        });

        it('should return a 404 if tournamentId is given but not valid', function () {
            //setup
            var req = {body: {tournamentId: '5452d71103aec67'}};
            var res = {
                json: sinon.spy()
            };
            //action
            tournamentControllerUtils.reportMatchHelper(req, res, serverUtils, null, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.calledOnce, true);
            assert.equal(res.json.calledOnce, true);
            assert.equal(res.json.getCall(0).args[0], 404);
        });

        it('should allow signupID to be used for reporting a match', function () {
            //setup
            var req = {body: {signupID: 'asdfasfdasdf5452d71103aec670587bea44'}};
            //action
            tournamentControllerUtils.reportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(tournamentModel.find.calledOnce, true);
        });

        it('should return a 404 if neither tournamentId or signupID were used to report a match', function () {
            //setup
            var req = {body: {}};
            var res = {
                json: sinon.spy()
            };
            //action
            tournamentControllerUtils.reportMatchHelper(req, res, serverUtils, null, null);
            //assert
            assert.equal(serverUtils.isThisTournamentIdValid.calledOnce, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(tournamentModel.find.called, false);
            assert.equal(res.json.calledOnce, true);
            assert.equal(res.json.getCall(0).args[0], 404);
        });
    });

    describe('Unreporting Helper', function () {
        it('should accept tournamentID as a tournament identifier to unreport a tournament', function () {
            //setup
            var req = {body: {tournamentId: '5452d71103aec670587bea44'}};
            //action
            tournamentControllerUtils.unreportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.find.called, false);
            assert.equal(tournamentModel.findById.calledOnce, true);
        });

        it('should return a 404 if tournamentId is present but invalid', function(){
            //setup
            var req = {body: {tournamentId: '5452d71103a7bea44'}};
            var res = {json:sinon.spy()};
            //action
            tournamentControllerUtils.unreportMatchHelper(req, res, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.find.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(res.json.calledOnce, true);
            assert.equal(res.json.getCall(0).args[0], 404);
        });

        it('should accept signupID as a tournament identifier to unreport a tournament', function(){
            //setup
            var req = {body: {signupID: '5452d71103aec670587bea44'}};
            //action
            tournamentControllerUtils.unreportMatchHelper(req, null, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.find.calledOnce, true);
            assert.equal(tournamentModel.findById.calledOnce, false);
        });

        it('should return a 404 if neither tournamentId nor signupID are provided', function(){
            //setup
            var req = {body: {}};
            var res = {json:sinon.spy()};
            //action
            tournamentControllerUtils.unreportMatchHelper(req, res, serverUtils, tournamentModel, null);
            //assert
            assert.equal(tournamentModel.find.called, false);
            assert.equal(tournamentModel.findById.called, false);
            assert.equal(res.json.calledOnce, true);
            assert.equal(res.json.getCall(0).args[0], 404);
        })
    });
});