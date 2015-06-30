'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SingleElim = require('../../../../lib/engines/singleElim').Engine;


var engine, callbackSpy, actualBracket;
var john = {name: 'john'};
var jane = {name: 'jane'};
var bob = {name: 'bob'};
var alice = {name: 'alice'};
var peter = {name: 'peter'};
var franz = {name: 'franz'};
var cole = {name: 'cole'};
var patrick = {name: 'patrick'};

beforeEach(function () {
    engine = new SingleElim();
    callbackSpy = sinon.spy(function (err, data) {
        actualBracket = data;
    });
});

describe('SingleElim - Match reporting', function () {
    describe('Unreport match', function () {
        it('should be able to unreport a match and update the bracket accordingly', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            actualBracket[1].score1 = 2;
            actualBracket[1].score2 = 0;
            actualBracket[1].complete = true;
            actualBracket[3].player1 = john;
            //action
            engine.unreport(1, actualBracket, callbackSpy);
            //assert
            var spyCallParam = callbackSpy.getCall(0).args[1];
            assert.equal(Object.keys(spyCallParam).length, 3);
            assert.equal(spyCallParam[3].player1, null);
            assert.equal(spyCallParam[3].player2, null);
            assert.equal(spyCallParam[1].complete, false);
            assert.equal(spyCallParam[1].score1, 0);
            assert.equal(spyCallParam[1].score2, 0);
        });
        it('should only allow unreport if the following match has not been reported', function () {
            //setup
            engine.initBracket([john, jane, bob, alice, cole, patrick, peter, franz], callbackSpy);
            engine.reportWin(1, 2, 0, actualBracket, callbackSpy);
            engine.reportWin(2, 2, 0, actualBracket, callbackSpy);
            engine.reportWin(3, 2, 0, actualBracket, callbackSpy);
            engine.reportWin(4, 2, 0, actualBracket, callbackSpy);
            engine.reportWin(5, 2, 0, actualBracket, callbackSpy);
            var unreportCallbackSpy = sinon.spy(function () {
            });
            //action
            engine.unreport(1, actualBracket, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.getCall(0).args[0].message, 'nextMatchAlreadyReported');
        });
        it('should only allow unreport of completed matches', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.unreport(3, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'cantUnreportIncompleteMatch');
        });

        it('should allow to unreport the completed finals of a bracket', function () {
            //seiup
            var reportWinCallback = function () {
            };
            var reportWinCallbackSpy = sinon.spy(reportWinCallback);
            engine.initBracket([john, jane], callbackSpy);
            engine.reportWin(1, 2, 0, actualBracket, reportWinCallbackSpy);
            //actpm
            engine.unreport(1, actualBracket, callbackSpy);
            //assert
            assert.equal(reportWinCallbackSpy.getCall(0).args[0], null);
            assert.equal(reportWinCallbackSpy.getCall(0).args[1][1].complete, false);
            assert.equal(reportWinCallbackSpy.getCall(0).args[1][1].score1, 0);
            assert.equal(reportWinCallbackSpy.getCall(0).args[1][1].score2, 0);
        });

        it('should not rely on player names for the next match in order to update it', function () {
            //setup
            var bracket = {
                '1': {},
                '2': {player1: bob, player2: alice, score1: 0, score2: 2, complete: true, next: 3},
                '3': {complete: false, player1: null, player2: alice}
            };
            try {
                //action
                engine.unreport(2, bracket, callbackSpy);
            } catch (exception) {
                //assert
                assert.ok(false);
            }
        });

        it('should return an error if we try to report a match without number', function () {
            //setup
            engine.initBracket([john, jane], callbackSpy);
            //action
            engine.unreport(null, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'numberlessMatchNotAllowed');
        });

        describe('defwin situation', function () {
            it('should not allow unreporting if match is complete but 2nd player has no opponent', function () {
                //setup
                //action
                engine.unreport(1, {'1': {number: 1, complete: true}}, callbackSpy);
                //assert
                assert.equal(callbackSpy.getCall(0).args[0].message, 'defWinCantBeUnreported');
            });

            it('should not allow unreporting if match is complete but 1st player has no opponent', function () {
                //setup
                //action
                engine.unreport(1, {'1': {number: 1, complete: true, player1: {}}}, callbackSpy);
                //assert
                assert.equal(callbackSpy.getCall(0).args[0].message, 'defWinCantBeUnreported');
            });
        });

    });
    describe('Report match', function () {
        it('should update next match with match winner', function () {
            //setup
            engine.initBracket([john, jane, bob, alice, peter], callbackSpy);
            //action
            engine.reportWin(2, 2, 0, actualBracket, callbackSpy);

            //assert
            assert.equal(actualBracket[5].player2.name, 'jane');
            assert.equal(actualBracket[2].complete, true);
            assert.equal(actualBracket[2].score1, 2);
            assert.equal(actualBracket[2].score2, 0);
        });

        it('should update the right slot of upcoming match', function () {
            //setup
            engine.initBracket([john, jane, bob, alice, peter], callbackSpy);
            //action
            engine.reportWin(2, 2, 0, actualBracket, callbackSpy);
            //assert
            assert.equal(actualBracket[5].player1.name, 'john');
            assert.equal(actualBracket[5].player2.name, 'jane');
        });

        it('should update next match with winners from both related matches', function () {
            //setup
            engine.initBracket([john, jane, bob, alice, peter, franz, cole], callbackSpy);
            //action
            engine.reportWin(2, 0, 2, actualBracket, callbackSpy);
            engine.reportWin(1, 2, 0, actualBracket, callbackSpy);

            //assert
            assert.equal(actualBracket[5].player1.name, 'john');
            assert.equal(actualBracket[5].player2.name, 'alice');
            assert.equal(actualBracket[1].complete, true);
            assert.equal(actualBracket[2].complete, true);
        });

        it('should not allow reporting an already reported match', function () {
            //setup
            engine.initBracket([john, jane, bob, alice, peter, franz, cole, patrick], callbackSpy);
            engine.reportWin(1, 2, 0, actualBracket, callbackSpy);
            //action
            engine.reportWin(1, 0, 2, actualBracket, callbackSpy);

            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.equal(Object.keys(callbackSpy.getCall(1).args[1]).length, 7);
            assert.equal(callbackSpy.getCall(2).args[0].message, 'alreadyReported');
        });
        it('should be able to tell if a tournament bracket is over', function () {
            //setup
            engine = new SingleElim();
            var reportWinCallbackSpy = sinon.spy(function (err, data) {
                actualBracket = data;
            });
            engine.initBracket([john, jane], callbackSpy);
            //action
            engine.reportWin(1, 0, 2, actualBracket, reportWinCallbackSpy);

            //assert
            assert.equal(reportWinCallbackSpy.getCall(0).args[0], null);
            assert.equal(Object.keys(reportWinCallbackSpy.getCall(0).args[1]).length, 1);
            assert.equal(reportWinCallbackSpy.getCall(0).args[2], true);
        });

        it('should be able to tell if a tournament bracket is not over', function () {
            //setup
            engine.initBracket([john, jane, bob, alice, peter], callbackSpy);
            //action
            engine.reportWin(1, 2, 0, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[2], false);
        });

        it('should not be able to update a match with uncomplete previous matches', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.reportWin(3, 2, 0, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'notAllPreviousMatchesAreComplete');
        });

        it('should return an error if we try to report a match without number', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.reportWin(null, 2, 0, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'numberlessMatchNotAllowed');
        });

        function testInvalidScoresWhenReporting(score1, score2) {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.reportWin(1, score1, score2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'invalidScores');
        }


        it('should only allow integers for score inputs', function () {
            testInvalidScoresWhenReporting('hello', 0);
        });

        it('should only allow integers for score inputs', function () {
            testInvalidScoresWhenReporting(null, 1);
        });

        it('should only allow integers for score inputs', function () {
            testInvalidScoresWhenReporting(undefined, 1);
        });

        it('should only allow integers for score inputs', function () {
            testInvalidScoresWhenReporting(0, 'hello');
        });

        it('should only allow integers for score inputs', function () {
            testInvalidScoresWhenReporting(1, null);
        });

        it('should only allow integers for score inputs', function () {
            testInvalidScoresWhenReporting(1, undefined);
        });

        it('should handle not being able to lookup next match (match has a "next" property but no such match exists in the bracket)', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            delete actualBracket[3];
            //action
            engine.reportWin(1, 2, 1, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'nextMatchDoesNotExist');
        });

        it('should return an error if we report a match of players w/ the same score', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.reportWin(1, 1, 1, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'winnerMustHaveHigherScore');
        });
    });
});