var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../lib/service/tournamentService').TournamentService;

describe('Tournament controller', function () {

    it('should return an error if save fails', function () {
        //setup
        var tournamentService = new TournamentService();
        var model = {save: function (callback) {
            callback(true);
        }}

        var res = {json: function (status, data) {
        }};
        sinon.spy(res, 'json');

        //actionstatus
        tournamentService.saveTournament({body: {}}, res, model);
        //assert
        assert.equal(400, res.json.getCall(0).args[0]);
    });

    it('should return admin and user URLs if save succeeds', function () {
        //setup
        var tournamentService = new TournamentService();
        var model = {save: function (callback) {
            callback(false);
        }, _id: 'abc'}

        var res = {json: function (status, data) {
        }};
        sinon.spy(res, 'json');

        var req = {body: {tournamentName: 'tournamentName'}};
        var res = {json: function (status, data) {
        }};

        sinon.spy(res, 'json');

        //action
        tournamentService.saveTournament(req, res, model);
        //assert
        assert.equal(res.json.getCall(0).args[0].adminURL, 'abc');
        assert.match(res.json.getCall(0).args[0].signupURL, /^tournamentName[0-9]+$/);
    });

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

    it('should not allow registration of the same player twice', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'toto'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [{name:'toto'}]});
        //assert
        assert.equal(res.json.getCall(0).args[0], 400);
        assert.equal(res.json.getCall(0).args[1].message, 'noDuplicateNick');
    });

    it('should not allow registration of the same player twice (use of caps)', function () {
        //setup
        var tournamentService = new TournamentService();
        var req = {body: {nick: 'TOtO'}};
        var res = {json: function (returnCode, data) {
        }};
        sinon.spy(res, 'json');
        //action
        tournamentService.registerPlayer(req, res, {players: [{name:'toto'}]});
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
})