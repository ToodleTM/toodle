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

describe('SimpleGSLGroups - winners', function () {
    it('should return an empty array if there are no finished groups', function () {
        //setup
        var winnersCallback = sinon.spy();
        engine.initBracket([john, jane, bob, alice], initBracketCallback);
        //action
        engine.winners(groups, winnersCallback);
        //assert
        assert.equal(winnersCallback.calledOnce, true);
        assert.equal(winnersCallback.getCall(0).args[0], null);
        assert.deepEqual(winnersCallback.getCall(0).args[1], []);
    });

    it('should return an array w/ the winners of group 1 if group1 is over', function () {
        //setup
        var winnersCallback = sinon.spy();
        engine.initBracket([john, jane, bob, alice], initBracketCallback);
        bob.winCount = 1;
        alice.winCount = 1;
        groups[1].matches[5].player1 = bob;
        groups[1].matches[5].player2 = alice;
        groups[1].matches[5].complete = true;
        //action
        engine.winners({bracket: groups}, winnersCallback);
        //assert
        assert.equal(winnersCallback.calledOnce, true);
        assert.equal(winnersCallback.getCall(0).args[0], null);
        assert.deepEqual(winnersCallback.getCall(0).args[1], [bob, alice]);
    });

    it('should return an array w/ only the winners of group 2 if group2 is over but not group1', function () {
        //setup
        var winnersCallback = sinon.spy();
        engine.initBracket([john, jane, bob, alice, cole, franz, giulietta, peter], initBracketCallback);
        peter.winCount = 1;
        franz.winCount = 1;
        groups[2].matches[10].player1 = peter;
        groups[2].matches[10].player2 = franz;
        groups[2].matches[10].complete = true;
        //action
        engine.winners({bracket: groups}, winnersCallback);
        //assert
        assert.equal(winnersCallback.calledOnce, true);
        assert.equal(winnersCallback.getCall(0).args[0], null);
        assert.deepEqual(winnersCallback.getCall(0).args[1], [franz, peter]);
    });

    it('should return a correctly formatted error if something goes wrong during one of the async calls', function () {
        //setup
        var winnersCallback = sinon.spy();
        engine.getWinnersFromGroup = function (group, engine, callback) {
            callback(true);
        };
        //action
        engine.winners({bracket: {1: {}, 2: {}}}, winnersCallback);
        //assert
        assert.equal(winnersCallback.calledOnce, true);
        assert.deepEqual(winnersCallback.getCall(0).args[0], {message: 'errorWhileGettingWinners'});
    });

    it('should return a correctly formatted error if something goes wrong during one of the async calls', function () {
        //setup
        var winnersCallback = sinon.spy();
        engine.getWinnersFromGroup = function () {
            throw new Error('some random engine error');
        };
        //action
        engine.winners({bracket: {1: {}, 2: {}}}, winnersCallback);
        //assert
        assert.equal(winnersCallback.calledOnce, true);
        assert.deepEqual(winnersCallback.getCall(0).args[0], {message: 'errorWhileGettingWinners'});
    });
});