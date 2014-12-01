'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;

describe('Mass seeding', function () {
    var tournamentService = new TournamentService();
    var res = null;
    var tournament = null;
    beforeEach(function(){
        res = {json:function(){}};
        tournament = {players:[]};
        sinon.spy(res, 'json');
    });
    it('should not modify the initial list of players if there is nothing to seed', function () {
        //setup

        //action
        var actual = tournamentService.multipleSeed(null, res, tournament, []);
        //assert
        assert.deepEqual(actual, tournament);
    });

    it('should be able to add players to the existing list the tournament has', function(){
        //setup
        //action
        var actual = tournamentService.multipleSeed(null, res, tournament, [{name:'larry'}]);
        //assert
        assert.deepEqual(actual, {players:[{name:'larry'}]});
    });

    it('should not be able to add the same player twice', function(){
        //setup
        //action
        var actual = tournamentService.multipleSeed(null, res, tournament, [{name:'larry'}, {name:'larry'}]);
        //assert
        assert.deepEqual(actual, {players:[{name:'larry'}]});
    });

    it('should not be able to add players w/ same nicks buth with different capitalization', function(){
        //setup
        //action
        var actual = tournamentService.multipleSeed(null, res, tournament, [{name:'laRrY'}, {name:'larry'}]);
        //assert
        assert.deepEqual(actual, {players:[{name:'laRrY'}]});
    });

    it('should not be able to add players w/ same nicks but w/ preceeding / trailing spaces', function(){
        //setup
        //action
        var actual = tournamentService.multipleSeed(null, res, tournament, [{name:'\tlarry  '}, {name:'  larry'}]);
        //assert
        assert.deepEqual(actual, {players:[{name:'larry'}]});
    });

    it('should not be able to insert a nick that already exists in the list', function(){
        //setup
        tournament.players.push({name:'lArry'});
        //action
        var actual = tournamentService.multipleSeed(null, res, tournament, [{name:'larry'}]);
        //assert
        assert.deepEqual(actual, {players:[{name:'lArry'}]});
    });
});