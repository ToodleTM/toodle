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
describe('SimpleGSLGroups - getMatchByNumber', function () {
    function getMatchByNumberTest(groups, matchNumber, expectedMatchValue) {
        //action
        var actual = engine.getMatchByNumber(groups, matchNumber);
        //assert
        assert.deepEqual(actual, expectedMatchValue);
    }

    it('should return null if no groups are specified', function () {
        getMatchByNumberTest(null, null, null);
    });

    it('should return null if matchNumber is NaN', function () {
        getMatchByNumberTest({1: {matches: {2: {player1: 'p1'}}}}, 'dfb', null);
    });

    it('should return match 2 from the 1st group if match id is 2', function () {
        getMatchByNumberTest({1: {matches: {2: {player1: 'p1'}}}}, 2, {player1: 'p1'});
    });

    it('should return match 5 from the 1st group if match id is 5', function () {
        getMatchByNumberTest({1: {matches: {5: {player1: 'p1'}}}}, 5, {player1: 'p1'});
    });

    it('should return match 1 from the 2nd group if match id is 6', function () {
        getMatchByNumberTest({2: {matches: {6: {player1: 'p1'}}}}, 6, {player1: 'p1'});
    });

    it('should return match 12 located in group 3 if match id is 12', function () {
        getMatchByNumberTest({
            1: {matches: {2: {player1: 'p1'}}},
            3: {matches: {12: {player1: 'p12'}, 13: {player1: 'p13'}}}
        }, 12, {player1: 'p12'});
    });

    it('should return null if match id is 0', function () {
        getMatchByNumberTest({
            1: {matches: {2: {player1: 'p1'}}},
            3: {matches: {12: {player1: 'p12'}, 13: {player1: 'p13'}}}
        }, 0, null);
    });

    it('should return null if match id is negative', function () {
        getMatchByNumberTest({
            1: {matches: {2: {player1: 'p1'}}},
            3: {matches: {12: {player1: 'p12'}, 13: {player1: 'p13'}}}
        }, -42, null);
    });

    it('should return null when requesting a group that does not exist', function () {
        getMatchByNumberTest({
            1: {matches: {2: {player1: 'p1'}}},
            3: {matches: {12: {player1: 'p12'}, 13: {player1: 'p13'}}}
        }, 1234, null);
    });
});