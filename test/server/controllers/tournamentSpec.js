'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var tournamentController = require('../../../lib/controllers/tournaments.js');

describe('Tournament Controller', function () {
    it('should not return admin properties when the /play endpoint is called', function () {
        //setup
        var req = {params: {}};
        var res = {
            json: sinon.spy()
        };
        var tournamentMock = {
            findOne: function (criteria, callback) {
                callback(null, {_doc: {_id: '_id', followingTournament: 'followup', parentTournament: 'parent'}});
            }
        };
        sinon.stub(tournamentController, 'tournament').returns(tournamentMock);
        //action
        tournamentController.play(req, res, null);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args, [{}]);
        tournamentController.tournament.restore();
    });

    describe('modifications forbidden when tournament has a follow-up', function () {
        var functionsToTest = ['updatePlayers', 'start', 'stop', 'addPlayer', 'multipleRegistration', 'removePlayer', 'rearrangePlayers', 'swapPlayers', 'genBracketForTournament', 'updateBracketDataAndStart'];

        functionsToTest.forEach(function(functionToTest){
            it('should return an error if the '+functionToTest+' service is called', function () {
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
                    findOne: function (criteria, callback) {
                        callback(null, {followingTournament: 'followingTournamentId'});
                    }
                };
                tournamentMock.findById = tournamentMock.findOne;

                var serverUtilsMock = {isThisTournamentIdValid:sinon.stub().returns(true)};
                sinon.stub(tournamentController, 'serverUtils').returns(serverUtilsMock);
                sinon.spy(res, 'status');
                sinon.stub(tournamentController, 'tournament').returns(tournamentMock);
                //action
                tournamentController[functionToTest]({query:{}, body: {}}, res, null);
                //assert
                assert.equal(res.status.calledOnce, true);
                assert.deepEqual(res.status.getCall(0).args, [400]);
                assert.equal(jsonSpy.calledOnce, true);
                assert.deepEqual(jsonSpy.getCall(0).args, [{message: 'tournamentLocked'}]);
                tournamentController.tournament.restore();
                tournamentController.serverUtils.restore();
            });
        });
    });
});