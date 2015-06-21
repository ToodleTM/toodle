'use strict';
var assert = require('chai').assert;
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;
describe('TournamentService - Get tournament engine', function () {
    it('should return null if tournament engine does not exist', function () {
        //setup
        var tournamentService = new TournamentService();
        //action
        var actual = tournamentService.getTournamentEngine('bob');
        //assert
        assert.equal(actual, null);
    });
});