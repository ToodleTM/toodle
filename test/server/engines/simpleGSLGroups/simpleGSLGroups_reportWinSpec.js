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

describe('SimpleGSLGroups - reportwin', function () {
    describe('error handling', function () {

        function testReportingErrors(players, matchNumber, score1, score2, expectedErrorMessage) {
            //setup
            var reportWinSpy = sinon.spy();
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(matchNumber, score1, score2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0].message, expectedErrorMessage);
        }

        it('should return an error if the two scores are equal', function () {
            testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick], 1, 2, 2, 'winnerMustHaveHigherScore');
        });

        it('should return an error if the 1st score is invalid', function () {
            testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick], 1, null, 2, 'invalidScores');
        });

        it('should return an error if the 2nd score is invalid', function () {
            testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick], 1, 2, null, 'invalidScores');
        });

        it('should return an error if the 1st score is negative', function () {
            testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick], 1, -1, 1, 'invalidScores');
        });

        it('should return an error if the 2ndt score is negative', function () {
            testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick], 1, 1, -1, 'invalidScores');
        });

        it('should return an error if match to report could not be found', function () {
            testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick], 123, 2, 0, 'cantUnreportUnknownMatch');
        });

        it('should not allow reporting if match is already complete', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(2, 2, 0, groups, reportWinSpy);
            //action
            engine.reportWin(2, 2, 0, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0], null);
            assert.equal(reportWinSpy.getCall(1).args[0].message, 'alreadyReported');
        });
    });

    it('should update match information when reporting', function () {
        //setup
        var reportWinSpy = sinon.spy();
        var players = [john, jane, bob, alice, cole, peter, franz, patrick];
        engine.initBracket(players, initBracketCallback);
        //action
        engine.reportWin(1, 2, 0, groups, reportWinSpy);
        //assert
        assert.equal(reportWinSpy.getCall(0).args[0], null);
        assert.deepEqual(reportWinSpy.getCall(0).args[1][1].matches[1], {
            player1Score: 2,
            player2Score: 0,
            complete: true,
            round: 1,
            player1: john,
            player2: alice,
            group: 1,
            number: 1
        });
    });

    describe('player seeding', function () {
        function testPlayerSeedingInUpcomingMatchFromRound1(matchToReport, matchToCheck, expectedPlayer1, expectedPlayer2) {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(matchToReport, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0], null);
            assert.deepEqual(groups[1].matches[matchToCheck].player1, expectedPlayer1);
            assert.deepEqual(groups[1].matches[matchToCheck].player2, expectedPlayer2);
            assert.deepEqual(groups[1].matches[matchToCheck].round, 2);
            assert.deepEqual(groups[1].matches[matchToCheck].group, 1);
        }

        it('should move the winner of the 1st round1 match to the round2 s winner match player1 slot', function () {
            testPlayerSeedingInUpcomingMatchFromRound1(1, 3, alice, undefined);
        });

        it('should move the loser of the 1st round1 match to the round2 s loser match player1 slot', function () {
            testPlayerSeedingInUpcomingMatchFromRound1(1, 4, john, undefined);
        });

        it('should move the winner of the 2nd round1 match to the round2 s winner match player2 slot', function () {
            testPlayerSeedingInUpcomingMatchFromRound1(2, 3, undefined, bob);
        });

        it('should move the winner of the 2nd round1 match to the round2 s winner match player2 slot', function () {
            testPlayerSeedingInUpcomingMatchFromRound1(2, 4, undefined, jane);
        });

        function testPlayerSeedingInUpcomingMatchFromRound2(matchToReport, expectedPlayer1, expectedPlayer2) {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(matchToReport, 0, 2, groups, reportWinSpy);
            //assert
            assert.deepEqual(groups[1].matches[5].player1, expectedPlayer1);
            assert.deepEqual(groups[1].matches[5].player2, expectedPlayer2);
            assert.deepEqual(groups[1].matches[5].round, 3);
            assert.deepEqual(groups[1].matches[5].group, 1);
        }

        it('should put the loser of round 2 s winner match into the 1st slot of the decider match', function () {
            testPlayerSeedingInUpcomingMatchFromRound2(3, alice, undefined);
        });

        it('should put the winner of round 2 s loser match into the 2nd slot of the decider match', function () {
            testPlayerSeedingInUpcomingMatchFromRound2(4, undefined, jane);
        });

        it('should correctly set both players of the decider match when all previous matches have been played out', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            engine.reportWin(3, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(4, 0, 2, groups, reportWinSpy);
            //assert
            assert.deepEqual(groups[1].matches[5].player1, alice);
            assert.deepEqual(groups[1].matches[5].player2, jane);
            assert.deepEqual(groups[1].matches[5].round, 3);
            assert.deepEqual(groups[1].matches[5].group, 1);
        });
    });

    describe('if some or all round 1 matches have not been played', function () {

        function testIncompleteRound1(matchNumberToTest, matchNumberToCheck) {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(matchNumberToTest, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(matchNumberToCheck, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(1).args[0].message, 'previousMatchesNotComplete');
        }

        it('should return an error if trying to report round2 s winner match (round1 1st match incomplete)', function () {
            testIncompleteRound1(2, 3);
        });

        it('should return an error if trying to report round2 s winner match (round1 2nd match incomplete)', function () {
            testIncompleteRound1(1, 3);
        });

        it('should return an error if trying to report round2 s loser match (round1 1st match incomplete)', function () {
            testIncompleteRound1(2, 4);
        });

        it('should return an error if trying to report round2 s loser match (round1 2nd match incomplete)', function () {
            testIncompleteRound1(1, 4);
        });

        it('should not be able to report the deciders match if one of the round2 matches is incomplete', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            engine.reportWin(3, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(5, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(3).args[0].message, 'previousMatchesNotComplete');
        });

        it('should not be able to report the deciders match if one of the round2 matches is incomplete', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            engine.reportWin(4, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(5, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(3).args[0].message, 'previousMatchesNotComplete');
        });

        it('should not be able to report the deciders match if one of the round1 matches is incomplete', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(5, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(1).args[0].message, 'previousMatchesNotComplete');
        });

    });

    describe('scoring', function () {
        var john = {};
        var alice = {};
        beforeEach(function () {
            john = {};
            alice = {};
        });
        it('should update match winner s winCount by his score and win count by 1', function () {
            //setup
            //action
            engine.updatePlayersScores(john, 3, alice, 1);
            //assert
            assert.equal(john.winCount, 3);
            assert.equal(john.lossCount, 1);
            assert.equal(john.win, 1);
        });

        it('should update match loser s lossCount by his score and loss count by 1', function () {
            //setup
            //action
            engine.updatePlayersScores(john, 2, alice, 1);
            //assert
            assert.equal(alice.winCount, 1);
            assert.equal(alice.lossCount, 2);
            assert.equal(alice.loss, 1);
        });

        it('should update match winner s wincount by adding his new score to the previous he had', function () {
            //setup
            john.winCount = 3;
            //action
            engine.updatePlayersScores(john, 2, alice, 1);
            //assert
            assert.equal(john.winCount, 5);
        });

        it('should update match loser s wincount by adding his new score to the previous he had', function () {
            //setup
            alice.winCount = 3;
            //action
            engine.updatePlayersScores(john, 2, alice, 1);
            //assert
            assert.equal(alice.winCount, 4);
        });

        it('should update match winner s losscount by adding his new score to the previous he had', function () {
            //setup
            john.lossCount = 3;
            //action
            engine.updatePlayersScores(john, 2, alice, 1);
            //assert
            assert.equal(john.lossCount, 4);
        });

        it('should update match loser s losscount by adding his new score to the previous he had', function () {
            //setup
            alice.lossCount = 3;
            //action
            engine.updatePlayersScores(john, 2, alice, 1);
            //assert
            assert.equal(alice.lossCount, 5);
        });
    });

    describe('player update triggering', function () {
        it('should trigger player information update for a valid match', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            sinon.spy(engine, 'updatePlayersScores');
            sinon.spy(engine, 'updatePlayerInGroupList');
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(1, 2, 0, groups, reportWinSpy);
            //assert
            assert.equal(engine.updatePlayersScores.calledOnce, true);
            assert.equal(engine.updatePlayerInGroupList.calledTwice, true);
            assert.deepEqual(engine.updatePlayersScores.getCall(0).args, [john, 2, alice, 0]);
            assert.deepEqual(engine.updatePlayerInGroupList.getCall(0).args[1], john);
            assert.deepEqual(engine.updatePlayerInGroupList.getCall(1).args[1], alice);
            assert.deepEqual(groups[1].players[0], {name: 'john', loss: 0, lossCount: 0, win: 1, winCount: 2});
            assert.deepEqual(groups[1].players[3], {name: 'alice', loss: 1, lossCount: 2, win: 0, winCount: 0});
        });
    });
});