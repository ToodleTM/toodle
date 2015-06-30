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
describe('SingleElim - Bracket infos', function () {

    describe('Get winner', function () {
        it('should return an error if match has not started yet', function () {
            //setup

            //action
            engine.winners({}, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(0).args[0].message, 'noWinnerTournamentNotStarted');
        });

        it('should return an error if tournament has started but is not yet finished', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var tournament = {running: true, bracket: actualBracket};
            //action
            engine.winners(tournament, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'noWinnerTournamentNotFinished');
        });

        it('should return an error if bracket is in an intermediate state', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var tournament = {running: true, bracket: actualBracket};
            engine.reportWin(1, 2, 0, tournament.bracket, callbackSpy);
            engine.reportWin(2, 2, 0, tournament.bracket, callbackSpy);
            //action
            engine.winners(tournament, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(3).args[0].message, 'noWinnerTournamentNotFinished');
        });

        it('should return the player1 of the last match in the bracket if player1 wins', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var tournament = {running: true, bracket: actualBracket};
            engine.reportWin(1, 2, 0, tournament.bracket, callbackSpy);
            engine.reportWin(2, 2, 0, tournament.bracket, callbackSpy);
            engine.reportWin(3, 2, 0, tournament.bracket, callbackSpy);
            //action
            engine.winners(tournament, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(4).args[0], null);
            assert.deepEqual(callbackSpy.getCall(4).args[1], [{name: 'john'}]);
        });

        it('should return the player2 of the last match in the bracket if player2 wins', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var tournament = {running: true, bracket: actualBracket};
            engine.reportWin(1, 2, 0, tournament.bracket, callbackSpy);
            engine.reportWin(2, 2, 0, tournament.bracket, callbackSpy);
            engine.reportWin(3, 2, 4, tournament.bracket, callbackSpy);
            //action
            engine.winners(tournament, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(4).args[0], null);
            assert.deepEqual(callbackSpy.getCall(4).args[1], [{name: 'bob'}]);
        });
    });

    describe('Matches to report', function () {
        it('should be an empty list if bracket is empty', function () {
            //setup
            engine.initBracket([], callbackSpy);
            var remainingCallbackSpy = sinon.spy();
            //action
            engine.getMatchesToReport(actualBracket, remainingCallbackSpy);
            //assert
            assert.equal(remainingCallbackSpy.getCall(0).args[0], null);
            assert.equal(remainingCallbackSpy.getCall(0).args[1].length, 0);
        });

        it('should return the 2 matches to report in a 2 match bracket w/ no previous reports', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var remainingCallbackSpy = sinon.spy();
            //action
            engine.getMatchesToReport(actualBracket, remainingCallbackSpy);
            //assert
            assert.equal(remainingCallbackSpy.getCall(0).args[0], null);
            assert.equal(remainingCallbackSpy.getCall(0).args[1].length, 2);
            assert.equal(remainingCallbackSpy.getCall(0).args[1][0].player1.name, 'john');
            assert.equal(remainingCallbackSpy.getCall(0).args[1][0].player2.name, 'jane');
            assert.equal(remainingCallbackSpy.getCall(0).args[1][1].player1.name, 'bob');
            assert.equal(remainingCallbackSpy.getCall(0).args[1][1].player2.name, 'alice');
        });

        it('should return a single match to report in a 2 match bracket if one match has already been reported', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var remainingCallbackSpy = sinon.spy();
            engine.reportWin(2, 2, 0, actualBracket, callbackSpy);
            //action
            engine.getMatchesToReport(actualBracket, remainingCallbackSpy);
            //assert
            assert.equal(remainingCallbackSpy.getCall(0).args[0], null);
            assert.equal(remainingCallbackSpy.getCall(0).args[1].length, 1);
            assert.equal(remainingCallbackSpy.getCall(0).args[1][0].player1.name, 'john');
            assert.equal(remainingCallbackSpy.getCall(0).args[1][0].player2.name, 'jane');
        });

        it('should return the last match to report in a 2 match bracket if both initial matches have been reported', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var remainingCallbackSpy = sinon.spy();
            engine.reportWin(2, 2, 0, actualBracket, callbackSpy);
            engine.reportWin(1, 2, 0, actualBracket, callbackSpy);
            //action
            engine.getMatchesToReport(actualBracket, remainingCallbackSpy);
            //assert
            assert.equal(remainingCallbackSpy.getCall(0).args[0], null);
            assert.equal(remainingCallbackSpy.getCall(0).args[1].length, 1);
            assert.equal(remainingCallbackSpy.getCall(0).args[1][0].player1.name, 'john');
            assert.equal(remainingCallbackSpy.getCall(0).args[1][0].player2.name, 'bob');
        });
    });
    describe('Matches to unreport', function () {
        it('should be an empty array if bracket is empty', function () {
            //setup
            engine.initBracket([], callbackSpy);
            var unreportableMatchesSpy = sinon.spy();
            //action
            engine.getUnreportableMatches(actualBracket, unreportableMatchesSpy);
            //assert
            assert.equal(unreportableMatchesSpy.getCall(0).args[0], null);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1].length, 0);
        });
        it('should return the completed match in a 2 match bracket', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var unreportableMatchesSpy = sinon.spy();
            engine.reportWin(1, 3, 0, actualBracket, callbackSpy);
            //action
            engine.getUnreportableMatches(actualBracket, unreportableMatchesSpy);
            //assert
            assert.equal(unreportableMatchesSpy.getCall(0).args[0], null);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1].length, 1);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].player1.name, 'john');
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].player2.name, 'jane');
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].number, 1);
        });
        it('should only allow to unreport the most recently completed matches', function () {
            //setup
            engine.initBracket([john, jane, bob, alice, peter, franz, cole, patrick], callbackSpy);
            var unreportableMatchesSpy = sinon.spy();
            engine.reportWin(1, 3, 0, actualBracket, callbackSpy);
            engine.reportWin(2, 3, 0, actualBracket, callbackSpy);
            engine.reportWin(5, 3, 0, actualBracket, callbackSpy);
            //action
            engine.getUnreportableMatches(actualBracket, unreportableMatchesSpy);
            //assert
            assert.equal(unreportableMatchesSpy.getCall(0).args[0], null);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1].length, 1);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].player1.name, 'john');
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].player2.name, 'bob');
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].number, 5);
        });

        it('should allow to unreport the last match of a bracket without trying to check its impossible next match', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            var unreportableMatchesSpy = sinon.spy();
            engine.reportWin(1, 3, 0, actualBracket, callbackSpy);
            engine.reportWin(2, 3, 0, actualBracket, callbackSpy);
            engine.reportWin(3, 3, 0, actualBracket, callbackSpy);
            //action
            engine.getUnreportableMatches(actualBracket, unreportableMatchesSpy);
            //assert
            assert.equal(unreportableMatchesSpy.getCall(0).args[0], null);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1].length, 1);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].player1.name, 'john');
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].player2.name, 'bob');
            assert.equal(unreportableMatchesSpy.getCall(0).args[1][0].number, 3);
        });

        it('should not consider a defwin as an unreportable match (2nd player defwin)', function () {
            //setup
            var unreportableMatchesSpy = sinon.spy();
            //action
            engine.getUnreportableMatches({
                '1': {
                    complete: true,
                    player1: null,
                    player2: {}
                }
            }, unreportableMatchesSpy);
            //assert
            assert.equal(unreportableMatchesSpy.getCall(0).args[0], null);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1].length, 0);
        });

        it('should not consider a defwin as an unreportable match (1st player defwin)', function () {
            //setup
            var unreportableMatchesSpy = sinon.spy();
            //action
            engine.getUnreportableMatches({
                '1': {
                    complete: true,
                    player1: {},
                    player2: null
                }
            }, unreportableMatchesSpy);
            //assert
            assert.equal(unreportableMatchesSpy.getCall(0).args[0], null);
            assert.equal(unreportableMatchesSpy.getCall(0).args[1].length, 0);
        });
    });
});