'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var _ = require('lodash');
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
describe('SimpleGSLGroups - getMatchesToReport', function () {
    var johnVSalice = {};
    var janeVSbob = {};
    var johnVSjane = {};
    var aliceVSbob = {};
    var janeVSalice = {};
    var coleVSpatrick = {};
    var peterVSfranz = {};
    beforeEach(function () {
        johnVSalice = {
            'group': 1,
            'number': 1,
            'player1': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'john'
            },
            'player2': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'alice'
            },
            'round': 1
        };
        janeVSbob = {
            'group': 1,
            'number': 2,
            'player1': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'jane'
            },
            'player2': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'bob'
            },
            'round': 1
        };

        coleVSpatrick = {
            'group': 2,
            'number': 6,
            'player1': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'cole'
            },
            'player2': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'patrick'
            },
            'round': 1
        };
        peterVSfranz = {
            'group': 2,
            'number': 7,
            'player1': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'peter'
            },
            'player2': {
                'win': 0,
                'loss': 0,
                'winCount': 0,
                'lossCount': 0,
                'name': 'franz'
            },
            'round': 1
        };
        johnVSjane = {
            'group': 1,
            'number': 3,
            'player1': {
                'lossCount': 0,
                'name': 'john',
                'win': 1,
                'winCount': 2,
                'loss': 0
            },
            'player2': {
                'lossCount': 0,
                'name': 'jane',
                'win': 1,
                'winCount': 2,
                'loss': 0
            },
            'round': 2
        };
        aliceVSbob = {
            'group': 1,
            'number': 4,
            'player1': {
                'loss': 1,
                'lossCount': 2,
                'name': 'alice',
                'winCount': 0,
                'win': 0
            },
            'player2': {
                'loss': 1,
                'lossCount': 2,
                'name': 'bob',
                'winCount': 0,
                'win': 0
            },
            'round': 2
        };

        janeVSalice = {
            'group': 1,
            'number': 5,
            'player1': {
                'loss': 1,
                'lossCount': 2,
                'name': 'jane',
                'win': 1,
                'winCount': 2
            },
            'player2': {
                'loss': 1,
                'lossCount': 2,
                'name': 'alice',
                'win': 1,
                'winCount': 2
            },
            'round': 3
        };

    });

    function testMatchesToReportLookup(players, expected, matchesToReport) {
        //setup
        var matchesToReportCallback = sinon.spy();

        engine.initBracket(players, initBracketCallback);
        _.each(matchesToReport, function (matchToReport) {
            engine.reportWin(matchToReport, 2, 0, groups, true, function () {
            });
        });
        //action
        engine.getMatchesToReport(groups, matchesToReportCallback);
        //assert
        assert.deepEqual(matchesToReportCallback.calledOnce, true);
        assert.deepEqual(matchesToReportCallback.getCall(0).args[0], null);
        assert.deepEqual(matchesToReportCallback.getCall(0).args[1], expected);
    }

    it('should return 2 round 1 matches if none of them are complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [johnVSalice, janeVSbob], []);
    });

    it('should return the 2nd match of round 1 if the first is complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [janeVSbob], [1]);
    });

    it('should return the 2nd match of round 1 if the first is complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [johnVSalice], [2]);
    });

    it('should return the matches from round2 if both round1 matches are complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [johnVSjane, aliceVSbob], [1, 2]);
    });

    it('should return the winner match from round2 if loser match is complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [johnVSjane], [1, 2, 4]);
    });

    it('should return the loser match from round2 if winner match is complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [aliceVSbob], [1, 2, 3]);
    });

    it('should return the decider match if both round 2 matches are complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [janeVSalice], [1, 2, 3, 4]);
    });

    it('should return an empty list if all matches (including decider) for the only group are complete', function () {
        testMatchesToReportLookup([john, jane, bob, alice], [], [1, 2, 3, 4, 5]);
    });

    it('should return matches from all groups if there is more than 1 group', function () {
        testMatchesToReportLookup([john, jane, bob, alice, cole, peter, franz, patrick], [janeVSalice, coleVSpatrick, peterVSfranz], [1, 2, 3, 4]);
    });
});