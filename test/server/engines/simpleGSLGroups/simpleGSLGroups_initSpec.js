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
var initBracketCallback = function (error, generatedGroups) {
    groups = generatedGroups;
};
beforeEach(function () {
    engine = new SimpleGSLGroups();
    groups = {};
    callbackSpy = sinon.spy(function (err, data) {
        if (data) {
            actualBracket = JSON.parse(JSON.stringify(data));
        } else {
            actualBracket = null;
        }
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

describe('SimpleGSLGroups - initBracket', function () {
    it('should return an error if players list is empty', function () {
        //setup
        var callbackSpy = sinon.spy();
        //action
        engine.initBracket([], callbackSpy);
        //assert
        assert.equal(callbackSpy.getCall(0).args[0].message, 'notEnoughPlayers');
    });

    it('should return an error if players list is not a multiple of 4', function () {
        //setup
        var callbackSpy = sinon.spy();
        //action
        engine.initBracket([john], callbackSpy);
        //assert
        assert.equal(callbackSpy.getCall(0).args[0].message, 'notEnoughPlayers');
    });

    it('should create a tournament w/ one pool and the list of 1st matches to play in it if the list of players contains 4 players', function () {
        //setup
        var callbackSpy = sinon.spy();
        var playersToInitGroups = [john, jane, bob, alice];
        //action
        engine.initBracket(playersToInitGroups, callbackSpy);
        //assert
        assert.equal(callbackSpy.getCall(0).args[0], null);
        assert.deepEqual(callbackSpy.getCall(0).args[1][1].players, [john, jane, bob, alice]);
        assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[1], {
            player1: john,
            player2: alice,
            number: 1,
            round: 1,
            group: 1
        });
        assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[2], {
            player1: jane,
            player2: bob,
            number: 2,
            round: 1,
            group: 1
        });
        assert.deepEqual(playersToInitGroups, [john, jane, bob, alice]); //ensure the init function did not modify the players array
    });

    it('should create as many groups as needed to fit all registered players into pools', function () {
        //setup
        var callbackSpy = sinon.spy();
        var players = [john, jane, bob, alice, cole, peter, franz, patrick, lilah, yuri, giulietta, manolo];

        //action
        engine.initBracket(players, callbackSpy);
        //assert
        assert.equal(callbackSpy.getCall(0).args[0], null);
        assert.equal(Object.keys(callbackSpy.getCall(0).args[1]).length, 3);
        assert.deepEqual(callbackSpy.getCall(0).args[1][1].players, [john, jane, bob, alice]);
        assert.deepEqual(callbackSpy.getCall(0).args[1][2].players, [cole, peter, franz, patrick]);
        assert.deepEqual(callbackSpy.getCall(0).args[1][3].players, [lilah, yuri, giulietta, manolo]);
    });

    function checkMatchData(match, expectedPlayer1, expectedPlayer2, expectedNumber, expectedRound, expectedGroup) {
        assert.deepEqual(match, {
            player1: expectedPlayer1,
            player2: expectedPlayer2,
            number: expectedNumber,
            round: expectedRound,
            group: expectedGroup
        });
    }

    it('should give a unique match identifier to each match in-between the groups', function () {
        //setup
        var callbackSpy = sinon.spy();
        var players = [john, jane, bob, alice, cole, peter, franz, patrick];

        //action
        engine.initBracket(players, callbackSpy);
        //assert
        assert.equal(callbackSpy.getCall(0).args[0], null);
        checkMatchData(callbackSpy.getCall(0).args[1][1].matches[1], john, alice, 1, 1, 1);
        checkMatchData(callbackSpy.getCall(0).args[1][1].matches[2], jane, bob, 2, 1, 1);
        checkMatchData(callbackSpy.getCall(0).args[1][2].matches[6], cole, patrick, 6, 1, 2);
        checkMatchData(callbackSpy.getCall(0).args[1][2].matches[7], peter, franz, 7, 1, 2);
    });

    it('should init multiple groups using the unique number of a match as the index in the group matches array', function () {
        //setup
        //action
        engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
        //assert
        assert.equal(groups[1].matches[1].number, 1);
        assert.equal(groups[1].matches[2].number, 2);
        assert.equal(groups[2].matches[6].number, 6);
        assert.equal(groups[2].matches[7].number, 7);
    });
});
