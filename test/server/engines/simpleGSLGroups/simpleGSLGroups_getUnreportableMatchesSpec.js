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

describe('SimpleGSLGroups - getUnreportableMatches', function () {
    it('should return an empty list if no matches can be unreported', function () {
        //setup
        var unreportCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice], initBracketCallback);

        //action
        engine.getUnreportableMatches(groups, unreportCallbackSpy);
        //assert
        assert.equal(unreportCallbackSpy.calledOnce, true);
        assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], []);
    });

    it('should return match1 of group 1 if match1 is the only complete one', function () {
        //setup
        var unreportCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice], initBracketCallback);
        engine.reportWin(1, 2, 0, groups, function () {
        });

        //action
        engine.getUnreportableMatches(groups, unreportCallbackSpy);
        //assert
        assert.equal(unreportCallbackSpy.calledOnce, true);
        assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{
            round: 1,
            group: 1,
            number: 1,
            complete: true,
            player1: {name: 'john', loss: 0, lossCount: 0, win: 1, winCount: 2},
            player2: {name: 'alice', loss: 1, lossCount: 2, win: 0, winCount: 0},
            player1Score: 2,
            player2Score: 0
        }]);
    });

    it('should return match1 of groups 1 and 2 if match1 is the only complete one in the 2 groups', function () {
        //setup
        var unreportCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
        engine.reportWin(1, 2, 0, groups, function () {
        });
        engine.reportWin(6, 1, 3, groups, function () {
        });
        //action
        engine.getUnreportableMatches(groups, unreportCallbackSpy);
        //assert
        assert.equal(unreportCallbackSpy.calledOnce, true);
        assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{
            round: 1,
            group: 1,
            number: 1,
            complete: true,
            player1: {name: 'john', loss: 0, lossCount: 0, win: 1, winCount: 2},
            player2: {name: 'alice', loss: 1, lossCount: 2, win: 0, winCount: 0},
            player1Score: 2,
            player2Score: 0
        }, {
            round: 1,
            group: 2,
            number: 6,
            complete: true,
            player1: {name: 'cole', loss: 1, lossCount: 3, win: 0, winCount: 1},
            player2: {name: 'patrick', loss: 0, lossCount: 1, win: 1, winCount: 3},
            player1Score: 1,
            player2Score: 3
        }]);
    });

    it('should return match3 of group 2 if its the only valid match to unreport', function () {
        //setup
        var unreportCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
        engine.reportWin(6, 2, 0, groups, function () {
        });
        engine.reportWin(7, 1, 3, groups, function () {
        });
        engine.reportWin(8, 1, 3, groups, function () {
        });
        //action
        engine.getUnreportableMatches(groups, unreportCallbackSpy);
        //assert
        assert.equal(unreportCallbackSpy.calledOnce, true);
        assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{
            round: 2,
            group: 2,
            number: 8,
            complete: true,
            player1: {name: 'cole', loss: 1, lossCount: 3, win: 1, winCount: 3},
            player2: {name: 'franz', loss: 0, lossCount: 2, win: 2, winCount: 6},
            player1Score: 1,
            player2Score: 3
        }]);
    });

    it('should return match4 of group 2 if its the only valid match to unreport', function () {
        //setup
        var unreportCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
        engine.reportWin(6, 2, 0, groups, function () {
        });
        engine.reportWin(7, 1, 3, groups, function () {
        });
        engine.reportWin(9, 3, 2, groups, function () {
        });
        //action
        engine.getUnreportableMatches(groups, unreportCallbackSpy);
        //assert
        assert.equal(unreportCallbackSpy.calledOnce, true);
        assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{
            round: 2,
            group: 2,
            number: 9,
            complete: true,
            player1: {name: 'patrick', loss: 1, lossCount: 4, win: 1, winCount: 3},
            player2: {name: 'peter', loss: 2, lossCount: 6, win: 0, winCount: 3},
            player1Score: 3,
            player2Score: 2
        }]);
    });

    it('should return the decider match only if it is marked as complete', function () {
        //setup
        var unreportCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
        engine.reportWin(6, 2, 0, groups, function () {
        });
        engine.reportWin(7, 1, 3, groups, function () {
        });
        engine.reportWin(8, 1, 3, groups, function () {
        });

        engine.reportWin(9, 3, 2, groups, function () {
        });
        engine.reportWin(10, 5, 3, groups, function () {
        });
        //action
        engine.getUnreportableMatches(groups, unreportCallbackSpy);
        //assert
        assert.equal(unreportCallbackSpy.calledOnce, true);
        assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{
            round: 3,
            group: 2,
            number: 10,
            complete: true,
            player1: {name: 'cole', loss: 1, lossCount: 6, win: 2, winCount: 8},
            player2: {name: 'patrick', loss: 2, lossCount: 9, win: 1, winCount: 6},
            player1Score: 5,
            player2Score: 3
        }]);
    });
});