var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;
describe('Player registration', function () {
    it('should reject a player registration w/ an empty player name', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: ''}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: []});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noEmptyNick');
    });

    it('should reject a player registration w/ a blank player name', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: '\t     '}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: []});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noEmptyNick');
    });

    it('should reject a player registration if tournament is locked', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [], locked: true});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'registrationLocked');
    });

    it('should not allow registration of the same player twice (strict)', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'toto'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [
            {name: 'toto'}
        ]});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noDuplicateNick');
    });

    it('should not allow registration of the same player twice (using mixed capitalization in nick)', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'TOtO'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [
            {name: 'toto'}
        ]});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noDuplicateNick');
    });

    it('should allow registration when nick is not empty and unused', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'toto'}};
        var res = {json: function (data) {
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
    });

    it('should return an error if new nick is valid but the app can t save', function () {
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'toto'}};
        var res = {json: function (data) {
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
    });

    it('should allow player add when using the admin id even if tournament is locked', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [], locked: true, save: function (callback) {
            callback(false)
        }}, true);
        //assert
        assert.equal(res.json.getCall(0).args[0].players[0].name, 'MAdJoHn_37658');
    });

    it('should not allow player registration if tournament is in progress (running)', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [], running: true, save: function (callback) {
            callback(false)
        }}, true);
        //assert
        assert.equal(res.json.getCall(0).args[0], 409);
        assert.equal(res.json.getCall(0).args[1].message, 'tournamentAlreadyRunning');
    });

    it('should be able to register a player w/ faction data', function(){
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'MAdJoHn_37658', faction:'murloc'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        var tournament = {
            players: [], save: function (callback) {
                callback(false)
            }
        };
        tournamentService.registerPlayer(req, res, tournament, true);
        //assert
        assert.deepEqual(res.json.getCall(0).args[0], tournament);
        assert.equal(tournament.players[0].faction, 'murloc');
    })
});