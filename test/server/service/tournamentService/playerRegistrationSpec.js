'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;
describe('TournamentService - Player registration', function () {
    it('should reject a player registration w/ an empty player name', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: ''}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: []});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noEmptyNick');
        assert.equal(res.json.calledOnce, true);
    });

    it('should reject a player registration w/ a blank player name', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: '\t     '}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: []});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noEmptyNick');
        assert.equal(res.json.calledOnce, true);
    });

    it('should reject a player registration if tournament is locked', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [], locked: true});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'registrationLocked');
        assert.equal(res.json.calledOnce, true);
    });

    it('should not allow registration of the same player twice (strict)', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'toto'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [
            {name: 'toto'}
        ]});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noDuplicateNick');
        assert.equal(res.json.calledOnce, true);
    });

    it('should not allow registration of the same player twice (using mixed capitalization in nick)', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'TOtO'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [
            {name: 'toto'}
        ]});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noDuplicateNick');
        assert.equal(res.json.calledOnce, true);
    });

    it('should allow registration when nick is not empty and unused', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'toto'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [
            {name: 'titi'}
        ], save: function (callback) {
            callback(false);
        }});
        //assert
        assert.equal(res.json.getCall(0).args[0].players[0].name, 'titi');
        assert.equal(res.json.getCall(0).args[0].players[1].name, 'toto');
        assert.equal(res.json.calledOnce, true);
    });

    it('should return an error if new nick is valid but the app can t save', function () {
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'toto'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [
            {name: 'titi'}
        ], save: function (callback) {
            callback(true);
        }});
        //assert
        assert.equal(res.json.getCall(0).args[0], 500);
        assert.equal(res.json.getCall(0).args[1].message, 'saveError');
        assert.equal(res.json.calledOnce, true);
    });

    it('should allow player add when using the admin id even if tournament is locked', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [], locked: true, save: function (callback) {
            callback(false);
        }}, true);
        //assert
        assert.equal(res.json.getCall(0).args[0].players[0].name, 'MAdJoHn_37658');
        assert.equal(res.json.calledOnce, true);
    });

    it('should not allow player registration if tournament is in progress (running)', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [], running: true, save: function (callback) {
            callback(false);
        }}, true);
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'tournamentAlreadyRunning');
        assert.equal(res.json.calledOnce, true);
    });

    it('should be able to register a player w/ faction data', function(){
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658', faction:'murloc'}};
        var res = {json: function () {
        }};
        sinon.spy(res, 'json');
        //action
        var tournament = {
            players: [], save: function (callback) {
                callback(false);
            }
        };
        tournamentService.registerPlayer(req, res, tournament, true);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], tournament);
        assert.equal(tournament.players[0].faction, 'murloc');
        assert.equal(res.json.calledOnce, true);
    });
});

describe('TournamentService - Unregister player', function(){
    it('should be able to unregister a player from an empty tournament (no players)', function(){
        //setup
        var tournamentService = new TournamentService();
        var req = {body:{nick:' john '}};
        var res = {
            json:function(){}
        };
        var tournament = {
            players:[],
            save:function(callback){
                callback(null, {});
            }
        };
        sinon.spy(res, 'json');
        sinon.spy(tournament, 'save');
        //action
        tournamentService.unregisterPlayer(req, res, tournament);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0].players, []);
        assert.equal(res.json.calledOnce, true);
    });
    it('should be able to unregister a player whose nick matches strictly the one of a registered player in a tournament', function(){
        //setup
        var tournamentService = new TournamentService();
        var req = {body:{nick:'john'}};
        var res = {
            json:function(){}
        };
        var tournament = {
            players:[{name:'john'}],
            save:function(callback){
                callback(null, {});
            }
        };
        sinon.spy(res, 'json');
        sinon.spy(tournament, 'save');
        //action
        tournamentService.unregisterPlayer(req, res, tournament);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0].players, []);
        assert.equal(tournament.save.calledOnce, true);
        assert.equal(res.json.calledOnce, true);
    });

    it('should be able to unregister a player whose _trimmed_ nick matches strictly the one of a registered player in a tournament', function(){
        //setup
        var tournamentService = new TournamentService();
        var req = {body:{nick:' john   '}};
        var res = {
            json:function(){}
        };
        var tournament = {
            players:[{name:'john'}],
            save:function(callback){
                callback(null, {});
            }
        };
        sinon.spy(res, 'json');
        sinon.spy(tournament, 'save');
        //action
        tournamentService.unregisterPlayer(req, res, tournament);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0].players, []);
        assert.equal(tournament.save.calledOnce, true);
        assert.equal(res.json.calledOnce, true);
    });

    it('should refuse to remove a player from a started tournament', function(){
        //setup
        var tournamentService = new TournamentService();
        var req = {body:{nick:' john '}};
        var res = {
            json:function(){}
        };
        var tournament = {
            running:true,
            players:[]
        };
        sinon.spy(res, 'json');
        //action
        tournamentService.unregisterPlayer(req, res, tournament);
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'cantRemovePlayerWhileRunning');
        assert.equal(res.json.calledOnce, true);
    });

});