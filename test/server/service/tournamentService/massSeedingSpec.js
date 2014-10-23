var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;

describe('Mass seeding', function () {
    var tournamentService = new TournamentService();
    it('should not modify the initial list of players if there is nothing to seed', function () {
        //setup
        var res = {json:function(){}};
        var tournament = {players:[]}
        sinon.spy(res, 'json');
        //action
        tournamentService.multipleSeed(null, res, tournament, null, []);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], tournament);
    });

    it('should be able to add players to the existing list the tournament has', function(){
        //setup
        var res = {json:function(){}};
        var tournament = {players:[]};
        sinon.spy(res, 'json');
        //action
        tournamentService.multipleSeed(null, res, tournament, null, [{name:'larry'}]);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], {players:[{name:'larry'}]});
    });

    it('should not be able to add the same player twice', function(){
        //setup
        var res = {json:function(){}};
        var tournament = {players:[]};
        sinon.spy(res, 'json');
        //action
        tournamentService.multipleSeed(null, res, tournament, null, [{name:'larry'}, {name:'larry'}]);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], {players:[{name:'larry'}]});
    });

    it('should not be able to add players w/ same nicks buth with different capitalization', function(){
        //setup
        var res = {json:function(){}};
        var tournament = {players:[]};
        sinon.spy(res, 'json');
        //action
        tournamentService.multipleSeed(null, res, tournament, null, [{name:'laRrY'}, {name:'larry'}]);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], {players:[{name:'laRrY'}]});
    });

    it('should not be able to add players w/ same nicks but w/ preceeding / trailing spaces', function(){
        //setup
        var res = {json:function(){}};
        var tournament = {players:[]};
        sinon.spy(res, 'json');
        //action
        tournamentService.multipleSeed(null, res, tournament, null, [{name:'\tlarry  '}, {name:'  larry'}]);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], {players:[{name:'larry'}]});
    });

    it('should not be able to insert a nick that already exists in the list', function(){
        //setup
        var res = {json:function(){}};
        var tournament = {players:[{name:'lArry'}]};
        sinon.spy(res, 'json');
        //action
        tournamentService.multipleSeed(null, res, tournament, null, [{name:'larry'}]);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], {players:[{name:'lArry'}]});
    });
});