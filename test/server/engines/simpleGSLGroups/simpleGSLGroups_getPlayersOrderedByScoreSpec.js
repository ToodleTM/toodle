'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SimpleGSLGroups = require('../../../../lib/engines/simpleGSLGroups').Engine;


var engine, callbackSpy, actualBracket;
var john = {name: 'john'};
var jane = {name: 'jane'};
var bob = {name: 'bob'};
var alice = {name: 'alice'};
var peter = {name: 'peter'};
var franz = {name: 'franz'};
var cole = {name: 'cole'};
var patrick = {name: 'patrick'};
var lilah = {name: 'lilah'};
var yuri = {name: 'yuri'};
var giulietta = {name: 'giulietta'};
var manolo = {name: 'manolo'};

var groups = {};

beforeEach(function () {
    engine = new SimpleGSLGroups();
    groups = {};
    callbackSpy = sinon.spy(function (err, data) {
        actualBracket = data;
    });

    john = {name: 'john'};
    jane = {name: 'jane'};
    bob = {name: 'bob'};
    alice = {name: 'alice'};
    peter = {name: 'peter'};
    franz = {name: 'franz'};
    cole = {name: 'cole'};
    patrick = {name: 'patrick'};
    lilah = {name: 'lilah'};
    yuri = {name: 'yuri'};
    giulietta = {name: 'giulietta'};
    manolo = {name: 'manolo'};
});
describe('SimpleGSLGroups - getPlayersOrderedByScore', function () {
    it('should return an error if the players list does not exist', function () {
        //setup
        var getPlayersOrderedByScoreCallback = sinon.spy();
        //action
        engine.getPlayersOrderedByScore({}, getPlayersOrderedByScoreCallback);
        //assert
        assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
        assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0].message, 'playersNotFound');
    });

    it('should return an error if the number of players in the group is higher than expected', function () {
        //setup
        var getPlayersOrderedByScoreCallback = sinon.spy();
        var group = {players: [john, cole, patrick, alice, giulietta]};
        //action
        engine.getPlayersOrderedByScore(group, getPlayersOrderedByScoreCallback);
        //assert
        assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
        assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0].message, 'tooManyPlayers');
    });

    it('should return an error if the number of players is lower than expected', function () {
        //setup
        var getPlayersOrderedByScoreCallback = sinon.spy();
        var group = {players: [john, cole, patrick]};
        //action
        engine.getPlayersOrderedByScore(group, getPlayersOrderedByScoreCallback);
        //assert
        assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
        assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0].message, 'tooFewPlayers');
    });

    it('should return an ordered list of players based on their goal-average (all no-matches)', function () {
        //setup
        var getPlayersOrderedByScoreCallback = sinon.spy();
        var group = {players: [john, cole, patrick, alice]};
        group.players[3].winCount = 4;
        group.players[3].lossCount = 0;
        group.players[2].winCount = 4;
        group.players[2].lossCount = 2;
        group.players[0].winCount = 2;
        group.players[0].lossCount = 4;
        group.players[1].winCount = 0;
        group.players[1].lossCount = 4;
        //action
        engine.getPlayersOrderedByScore(group, getPlayersOrderedByScoreCallback);
        //assert
        assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
        assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0], null);
        assert.deepEqual(getPlayersOrderedByScoreCallback.getCall(0).args[1], [alice, patrick, john, cole]);
    });
});