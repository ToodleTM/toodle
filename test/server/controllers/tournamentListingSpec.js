'use strict';
var TournamentListingController = require('../../../lib/controllers/tournamentListing.js').TournamentListingController;
var assert = require('chai').assert;
var sinon = require('sinon');

describe('Tournament Listing controller', function () {
    var controller = null;
    beforeEach(function () {
        controller = new TournamentListingController();
    });

    it('should order the tournaments list by date', function () {
        //setup
        var req = {query: {pageNumber: 1}},
            res = {json: sinon.spy()};
        var tournamentModelMock = {
            find: function (criteria, projection, options, callback) {
                callback(null, []);
            }
        };
        sinon.spy(tournamentModelMock, 'find');
        sinon.stub(controller, 'tournamentModel').returns(tournamentModelMock);
        //action
        controller.listTournaments(req, res);
        //assert
        assert.equal(tournamentModelMock.find.calledOnce, true);
        assert.deepEqual(tournamentModelMock.find.getCall(0).args[0], {public: true});
        assert.deepEqual(tournamentModelMock.find.getCall(0).args[1], {});
        assert.deepEqual(tournamentModelMock.find.getCall(0).args[2], {
            skip: 20 * (0),
            limit: 20,
            sort: {creationTimestamp: -1}
        });
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args, [[]]);
    });

    it('should return an error if database lookup fails', function () {
        //setup
        var jsonSpy = sinon.spy();
        var req = {query: {pageNumber: 1}},
            res = {
                status: function () {
                    var status = function(){};
                    status.json = jsonSpy;
                    return status;
                }
            };
        var tournamentModelMock = {
            find: function (criteria, projection, options, callback) {
                callback(true);
            }
        };
        sinon.spy(res, 'status');
        sinon.spy(tournamentModelMock, 'find');
        sinon.stub(controller, 'tournamentModel').returns(tournamentModelMock);
        //action
        controller.listTournaments(req, res);
        //assert
        assert.equal(tournamentModelMock.find.calledOnce, true);
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 500);
        assert.equal(jsonSpy.calledOnce, true);
        assert.deepEqual(jsonSpy.getCall(0).args, [{message: 'lookupError'}]);
    });

    it('should not return complete mongo result set but a set of documents without the _id attribute', function(){
        //setup
        var jsonSpy = sinon.spy();
        var req = {query: {pageNumber: 1}},
            res = {
                status: function () {
                    var status = function () {
                    };
                    status.json = jsonSpy;
                    return status;
                },
                json:sinon.spy()
            };
        var tournamentModelMock = {
            find: function (criteria, projection, options, callback) {
                callback(null, [{_doc:{tournamentName:'tournament name', _id:1234}}]);
            }
        };
        sinon.spy(res, 'status');
        sinon.spy(tournamentModelMock, 'find');
        sinon.stub(controller, 'tournamentModel').returns(tournamentModelMock);
        //action
        controller.listTournaments(req, res);
        //assert
        assert.equal(tournamentModelMock.find.calledOnce, true);
        assert.equal(res.status.called, false);
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args[0], [{tournamentName: 'tournament name'}]);
    });
});