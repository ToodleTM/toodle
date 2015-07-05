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

describe('getWinnersFromGroup', function () {
    it('should return the winners of a group if all matches have been played', function () {
        //setup
        var getWinnersFropGroupCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice], initBracketCallback);
        engine.reportWin(1, 2, 0, groups, function () {
        });
        engine.reportWin(2, 2, 0, groups, function () {
        });
        engine.reportWin(3, 2, 0, groups, function () {
        });
        engine.reportWin(4, 2, 0, groups, function () {
        });
        engine.reportWin(5, 2, 0, groups, function () {
        });
        //action
        engine.getWinnersFromGroup(groups[1], engine, getWinnersFropGroupCallbackSpy);
        //assert
        assert.equal(getWinnersFropGroupCallbackSpy.calledOnce, true);
        assert.equal(getWinnersFropGroupCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(getWinnersFropGroupCallbackSpy.getCall(0).args[1], [john, jane]);
    });

    it('should return an empty array if matches are not over for the current group', function () {
        //setup
        var getWinnersFropGroupCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice], initBracketCallback);
        engine.reportWin(1, 2, 0, groups, function () {
        });
        engine.reportWin(2, 2, 0, groups, function () {
        });
        engine.reportWin(3, 2, 0, groups, function () {
        });
        engine.reportWin(4, 2, 0, groups, function () {
        });
        //action
        engine.getWinnersFromGroup(groups[1], engine, getWinnersFropGroupCallbackSpy);
        //assert
        assert.equal(getWinnersFropGroupCallbackSpy.calledOnce, true);
        assert.equal(getWinnersFropGroupCallbackSpy.getCall(0).args[0], null);
        assert.deepEqual(getWinnersFropGroupCallbackSpy.getCall(0).args[1], []);
    });

    it('should bubble incoming errors up to the caller', function () {
        //setup
        var getWinnersFropGroupCallbackSpy = sinon.spy();
        engine.initBracket([john, jane, bob, alice], initBracketCallback);
        engine.getPlayersOrderedByScore = function (data, callback) {
            callback({message: 'someError'});
        };
        //action
        engine.getWinnersFromGroup(groups[1], engine, getWinnersFropGroupCallbackSpy);
        //assert
        assert.equal(getWinnersFropGroupCallbackSpy.calledOnce, true);
        assert.equal(getWinnersFropGroupCallbackSpy.getCall(0).args[0].message, 'someError');
    });
});