'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;
describe('TournamentService - Tournament locking / unlocking', function () {
    it('should be possible to lock anytime', function () {
        //setup
        var tournamentService = new TournamentService();
        var res = {
            json: function () {
            }
        };
        sinon.spy(res, 'json');
        var tournament = {running: false};
        var model = {update: function (selector, data, callback) {
            callback(null, {});
        }};
        sinon.spy(model, 'update');
        //action
        tournamentService.lockTournament(null, res, tournament, model);
        //assert
        assert.equal(res.json.getCall(0).args[0], tournament);
        assert.equal(model.update.calledOnce, true);
        assert.equal(res.json.calledOnce, true);
    });

    it('should not be possible to unlock if tournament is running', function () {
        //setup
        var tournamentService = new TournamentService();
        var res = {
            json: function () {}
        };
        sinon.spy(res, 'json');
        //action
        tournamentService.unlockTournament(null, res, {running: true}, null);
        //assert
        assert.equal(res.json.getCall(0).args[0], 409);
        assert.equal(res.json.getCall(0).args[1].message, 'cantUnlockRunningTournament');
        assert.equal(res.json.calledOnce, true);
    });

    it('should be possible to unlock if tournament is not running', function () {
        //setup
        var tournamentService = new TournamentService();
        var res = {
            json: function () {
            }
        };
        var tournament = {};

        var model = {
            update: function (a, b, callback) {
                callback(null, {});
            }
        };

        sinon.spy(res, 'json');
        //action
        tournamentService.unlockTournament(null, res, tournament, model);
        //assert
        assert.equal(res.json.getCall(0).args[0], tournament);
        assert.equal(res.json.calledOnce, true);
    });
});