var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;
describe('Get tournament engine', function () {
    it('should return null if tournament engine does not exist', function () {
        //setup
        var tournamentService = new TournamentService();
        //action
        var actual = tournamentService.getTournamentEngine('bob');
        //assert
        assert.equal(actual, null);
    });
});