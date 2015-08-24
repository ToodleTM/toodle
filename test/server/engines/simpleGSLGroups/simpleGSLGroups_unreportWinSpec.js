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
        actualBracket = JSON.parse(JSON.stringify(data));
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
describe('SimpleGSLGroups - unreportWin', function () {
    describe('error handling', function () {
        it('should not be able to unreport an incomplete match', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            //action
            engine.unreport(1, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0].message, 'cannotUnreportIncompleteMatch');
        });

        it('should not be able to unreport an unknown match', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            //action
            engine.unreport(42, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0].message, 'cannotUnreportUnknownMatch');
        });

        it('should not be able to unreport a round1 match when a round2 match is complete', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, true, function () {
            });
            engine.reportWin(2, 2, 0, groups, true, function () {
            });
            engine.reportWin(3, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(1, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0].message, 'mustUnreportFollowUpMatchesBeforeThisOne');
        });

        it('should not be able to unreport a round2 match when deciders match is complete', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, true, function () {
            });
            engine.reportWin(2, 2, 0, groups, true, function () {
            });
            engine.reportWin(3, 2, 0, groups, true, function () {
            });
            engine.reportWin(4, 2, 0, groups, true, function () {
            });
            engine.reportWin(5, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(4, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0].message, 'mustUnreportFollowUpMatchesBeforeThisOne');
        });
    });

    describe('actual player unreporting', function () {
        it('should not reset player data when unreporting a match', function () {
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            john.loss = 0;
            john.lossCount = 0;
            john.winCount = 0;
            john.win = 0;
            alice.loss = 0;
            alice.lossCount = 0;
            alice.winCount = 0;
            alice.win = 0;
            engine.reportWin(1, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(1, groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[1], {
                round: 1,
                complete: false,
                player1: john,
                player2: alice,
                group: 1,
                number: 1
            });
        });

        it('should reset 1st players in round2 matches when unreporting the 1st round1 match', function () {
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(1, groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[3].player1, null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[4].player1, null);
        });

        it('should reset 2nd players in round2 matches when unreporting the 2nd round1 match', function () {
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(2, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(2, groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[3].player2, null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[4].player2, null);
        });

        it('should reset 1st player in decider match when unreporting the winners match', function () {
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, true, function () {
            });
            engine.reportWin(2, 2, 0, groups, true, function () {
            });
            engine.reportWin(3, 2, 0, groups, true, function () {
            });

            //action
            engine.unreport(3, groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[5].player1, null);
        });

        it('should reset 2nd player in decider match when unreporting the losers match', function () {
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, true, function () {
            });
            engine.reportWin(2, 2, 0, groups, true, function () {
            });
            engine.reportWin(4, 2, 0, groups, true, function () {
            });

            //action
            engine.unreport(4, groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[5].player2, null);
        });

        it('should restore previous scores / counts when unreporting', function () {
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, true, function () {
            });
            engine.reportWin(2, 0, 3, groups, true, function () {
            });
            engine.reportWin(3, 5, 2, groups, true, function () {
            });

            //action
            engine.unreport(3, groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player1.win, 1);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player1.loss, 0);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player1.winCount, 2);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player1.lossCount, 0);

            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player2.win, 0);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player2.loss, 1);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player2.winCount, 0);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[1].player2.lossCount, 2);

            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player1.win, 0);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player1.loss, 1);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player1.winCount, 0);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player1.lossCount, 3);

            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player2.win, 1);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player2.loss, 0);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player2.winCount, 3);
            assert.equal(unreportCallbackSpy.getCall(0).args[1][1].matches[2].player2.lossCount, 0);
        });

        it('should be able to unreport decider matches from all groups', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, giulietta], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, true, function () {
            });
            engine.reportWin(7, 2, 0, groups, true, function () {
            });
            engine.reportWin(8, 2, 0, groups, true, function () {
            });
            engine.reportWin(9, 2, 0, groups, true, function () {
            });
            engine.reportWin(10, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(10, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0], null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[10].player1, peter);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[10].player2, giulietta);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[10].player1Score, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[10].player2Score, null);
        });

        it('should be able to unreport winner matches from all groups and update the appropriate matches', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, giulietta], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, true, function () {
            });
            engine.reportWin(7, 2, 0, groups, true, function () {
            });
            engine.reportWin(8, 2, 0, groups, true, function () {
            });
            engine.reportWin(9, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(8, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0], null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[8].player1, cole);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[8].player2, peter);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[10].player1, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[8].player1Score, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[8].player2Score, null);
        });

        it('should be able to unreport loser matches from all groups and update the appropriate matches', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, giulietta], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, true, function () {
            });
            engine.reportWin(7, 2, 0, groups, true, function () {
            });
            engine.reportWin(8, 2, 0, groups, true, function () {
            });
            engine.reportWin(9, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(9, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0], null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[9].player1, giulietta);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[9].player2, franz);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[10].player2, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[9].player1Score, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[9].player2Score, null);
        });

        it('should be able to unreport 1st round1 matches from all groups and update the appropriate matches', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, giulietta], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, true, function () {
            });
            engine.reportWin(7, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(6, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0], null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].player1, cole);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].player2, giulietta);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[8].player1, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[9].player1, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].player1Score, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].player2Score, null);
        });

        it('should be able to unreport 2nd round1 matches from all groups and update the appropriate matches', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, giulietta], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, true, function () {
            });
            engine.reportWin(7, 2, 0, groups, true, function () {
            });
            //action
            engine.unreport(7, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0], null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[7].player1, peter);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[7].player2, franz);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[8].player2, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[9].player2, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[7].player1Score, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[7].player2Score, null);
        });

        it('should remove forfeit flags when unreporting a forfeit', function () {
            //setup
            var unreportSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, giulietta], initBracketCallback);
            engine.forfeit(6, 2, 1, 2, groups, function () {
            });
            //action
            engine.unreport(6, groups, unreportSpy);
            //assert
            assert.equal(unreportSpy.getCall(0).args[0], null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].player1, cole);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].player2, giulietta);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].winner, null);
            assert.equal(unreportSpy.getCall(0).args[1][2].matches[6].forfeit, null);
        });
    });
});