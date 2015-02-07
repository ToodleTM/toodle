'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var _ = require('lodash');
var SimpleGSLGroups = require('../../../lib/gameRules/simpleGSLGroups').Engine;

describe('SimpleGSLPool engine', function () {
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

    describe('initBracket', function () {
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

        function checkMatchData(match, expectedPlayer1, expectedPlayer2, expectedNumber, expectedRound, expectedGroup){
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

            //assert.equal(groups[1].matches[3], null);
            //assert.equal(groups[1].matches[4], null);
            //assert.equal(groups[1].matches[5], null);
            //assert.equal(groups[2].matches[8], null);
            //assert.equal(groups[2].matches[9], null);
            //assert.equal(groups[2].matches[10], null);
        });
    });

    describe('reportwin', function () {
        describe('error handling', function () {

            function testReportingErrors(players, matchNumber, score1, score2, expectedErrorMessage){
                //setup
                var reportWinSpy = sinon.spy();
                engine.initBracket(players, initBracketCallback);
                //action
                engine.reportWin(matchNumber, score1, score2, groups, reportWinSpy);
                //assert
                assert.equal(reportWinSpy.getCall(0).args[0].message, expectedErrorMessage);
            }

            it('should return an error if the two scores are equal', function () {
                testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick],1, 2, 2, 'winnerMustHaveHigherScore');
            });

            it('should return an error if the 1st score is invalid', function () {
                testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick],1, null, 2, 'invalidScores');
            });

            it('should return an error if the 1st score is invalid', function () {
                testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick],1, 2, null,'invalidScores');
            });

            it('should return an error if match to report could not be found', function () {
                testReportingErrors([john, jane, bob, alice, cole, peter, franz, patrick],123, 2, 0, 'notFound');
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

            it('should not be able to report the deciders match if one of the round2 matches is incomplete', function(){
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

            it('should not be able to report the deciders match if one of the round2 matches is incomplete', function(){
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

            it('should not be able to report the deciders match if one of the round1 matches is incomplete', function(){
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
                engine.initBracket(players, initBracketCallback);
                //action
                engine.reportWin(1, 2, 0, groups, reportWinSpy);
                //assert
                assert.equal(engine.updatePlayersScores.calledOnce, true);
                assert.deepEqual(engine.updatePlayersScores.getCall(0).args, [john, 2, alice, 0]);
            });
        });
    });

    describe('getMatchByNumber', function () {
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

    describe('getMatchesToReport', function () {
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
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
                    'name': 'john'
                },
                'player2': {
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
                    'name': 'alice'
                },
                'round': 1
            };
            janeVSbob = {
                'group': 1,
                'number': 2,
                'player1': {
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
                    'name': 'jane'
                },
                'player2': {
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
                    'name': 'bob'
                },
                'round': 1
            };

            coleVSpatrick = {
                'group': 2,
                'number': 6,
                'player1': {
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
                    'name': 'cole'
                },
                'player2': {
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
                    'name': 'patrick'
                },
                'round': 1
            };
            peterVSfranz = {
                'group': 2,
                'number': 7,
                'player1': {
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
                    'name': 'peter'
                },
                'player2': {
                    'win':0,
                    'loss':0,
                    'winCount':0,
                    'lossCount':0,
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
                    'loss':0
                },
                'player2': {
                    'lossCount': 0,
                    'name': 'jane',
                    'win': 1,
                    'winCount': 2,
                    'loss':0
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
                    'win':0
                },
                'player2': {
                    'loss': 1,
                    'lossCount': 2,
                    'name': 'bob',
                    'winCount': 0,
                    'win':0
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
                engine.reportWin(matchToReport, 2, 0, groups, function () {
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

        it('should return matches from all groups if there is more than 1 group', function () {
            testMatchesToReportLookup([john, jane, bob, alice, cole, peter, franz, patrick], [janeVSalice, coleVSpatrick, peterVSfranz], [1, 2, 3, 4]);
        });
    });

    describe('unreportWin', function () {
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

            it('should not be able to unreport an unknown match', function(){
                //setup
                var unreportSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                //action
                engine.unreport(42, groups, unreportSpy);
                //assert
                assert.equal(unreportSpy.getCall(0).args[0].message, 'cannotUnreportUnknownMatch');
            });

            it('should not be able to unreport a round1 match when a round2 match is complete', function(){
                //setup
                var unreportSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                engine.reportWin(1, 2, 0, groups, function(){});
                engine.reportWin(2, 2, 0, groups, function(){});
                engine.reportWin(3, 2, 0, groups, function(){});
                //action
                engine.unreport(1, groups, unreportSpy);
                //assert
                assert.equal(unreportSpy.getCall(0).args[0].message, 'mustUnreportFollowUpMatchesBeforeThisOne');
            });

            it('should not be able to unreport a round2 match when deciders match is complete', function(){
                //setup
                var unreportSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                engine.reportWin(1, 2, 0, groups, function(){});
                engine.reportWin(2, 2, 0, groups, function(){});
                engine.reportWin(3, 2, 0, groups, function(){});
                engine.reportWin(4, 2, 0, groups, function(){});
                engine.reportWin(5, 2, 0, groups, function(){});
                //action
                engine.unreport(4, groups, unreportSpy);
                //assert
                assert.equal(unreportSpy.getCall(0).args[0].message, 'mustUnreportFollowUpMatchesBeforeThisOne');
            });
        });

        describe('actual player unreporting', function(){
            it('should not reset player data when unreporting a match', function(){
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
                engine.reportWin(1, 2, 0, groups, function(){});
                //action
                engine.unreport(1, groups, unreportCallbackSpy);
                //assert
                assert.equal(unreportCallbackSpy.calledOnce, true);
                assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
                assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[1], {round:1,complete:false,player1:john, player2:alice, group:1, number:1});
            });

            it('should reset 1st players in round2 matches when unreporting the 1st round1 match', function(){
                //setup
                var unreportCallbackSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                engine.reportWin(1, 2, 0, groups, function(){});
                //action
                engine.unreport(1, groups, unreportCallbackSpy);
                //assert
                assert.equal(unreportCallbackSpy.calledOnce, true);
                assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
                assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[3].player1, null);
                assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[4].player1, null);
            });

            it('should reset 2nd players in round2 matches when unreporting the 2nd round1 match', function(){
                //setup
                var unreportCallbackSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                engine.reportWin(2, 2, 0, groups, function(){});
                //action
                engine.unreport(2, groups, unreportCallbackSpy);
                //assert
                assert.equal(unreportCallbackSpy.calledOnce, true);
                assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
                assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[3].player2, null);
                assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[4].player2, null);
            });

            it('should reset 1st player in decider match when unreporting the winners match', function(){
                //setup
                var unreportCallbackSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                engine.reportWin(1, 2, 0, groups, function(){});
                engine.reportWin(2, 2, 0, groups, function(){});
                engine.reportWin(3, 2, 0, groups, function(){});

                //action
                engine.unreport(3, groups, unreportCallbackSpy);
                //assert
                assert.equal(unreportCallbackSpy.calledOnce, true);
                assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
                assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[5].player1, null);
            });

            it('should reset 2nd player in decider match when unreporting the losers match', function(){
                //setup
                var unreportCallbackSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                engine.reportWin(1, 2, 0, groups, function(){});
                engine.reportWin(2, 2, 0, groups, function(){});
                engine.reportWin(4, 2, 0, groups, function(){});

                //action
                engine.unreport(4, groups, unreportCallbackSpy);
                //assert
                assert.equal(unreportCallbackSpy.calledOnce, true);
                assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
                assert.deepEqual(unreportCallbackSpy.getCall(0).args[1][1].matches[5].player2, null);
            });

            it('should restore previous scores / counts when unreporting', function(){
                //setup
                var unreportCallbackSpy = sinon.spy();
                engine.initBracket([john, jane, bob, alice], initBracketCallback);
                engine.reportWin(1, 2, 0, groups, function(){});
                engine.reportWin(2, 0, 3, groups, function(){});
                engine.reportWin(3, 5, 2, groups, function(){});

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
        });
    });

    describe('getUnreportableMatches', function(){
        it('should return an empty list if no matches can be unreported', function(){
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

        it('should return match1 of group 1 if match1 is the only complete one', function(){
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, function(){});

            //action
            engine.getUnreportableMatches(groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{round:1, group:1, number:1, complete:true, player1:{name:'john', loss:0, lossCount:0, win:1, winCount:2}, player2:{name:'alice', loss:1, lossCount:2, win:0, winCount:0}, player1Score:2, player2Score:0}]);
        });

        it('should return match1 of groups 1 and 2 if match1 is the only complete one in the 2 groups', function(){
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, function(){});
            engine.reportWin(6, 1, 3, groups, function(){});
            //action
            engine.getUnreportableMatches(groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{round:1, group:1, number:1, complete:true, player1:{name:'john', loss:0, lossCount:0, win:1, winCount:2}, player2:{name:'alice', loss:1, lossCount:2, win:0, winCount:0}, player1Score:2, player2Score:0},{round:1, group:2, number:6, complete:true, player1:{name:'cole', loss:1, lossCount:3, win:0, winCount:1}, player2:{name:'patrick', loss:0, lossCount:1, win:1, winCount:3}, player1Score:1, player2Score:3}]);
        });

        it('should return match3 of group 2 if its the only valid match to unreport', function(){
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, function(){});
            engine.reportWin(7, 1, 3, groups, function(){});
            engine.reportWin(8, 1, 3, groups, function(){});
            //action
            engine.getUnreportableMatches(groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{round:2, group:2, number:8, complete:true, player1:{name:'cole', loss:1, lossCount:3, win:1, winCount:3}, player2:{name:'franz', loss:0, lossCount:2, win:2, winCount:6}, player1Score:1, player2Score:3}]);
        });

        it('should return match4 of group 2 if its the only valid match to unreport', function(){
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, function(){});
            engine.reportWin(7, 1, 3, groups, function(){});
            engine.reportWin(9, 3, 2, groups, function(){});
            //action
            engine.getUnreportableMatches(groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{round:2, group:2, number:9, complete:true, player1:{name:'patrick', loss:1, lossCount:4, win:1, winCount:3}, player2:{name:'peter', loss:2, lossCount:6, win:0, winCount:3}, player1Score:3, player2Score:2}]);
        });

        it('should return the decider match only if it is marked as complete', function(){
            //setup
            var unreportCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, peter, franz, patrick], initBracketCallback);
            engine.reportWin(6, 2, 0, groups, function(){});
            engine.reportWin(7, 1, 3, groups, function(){});
            engine.reportWin(8, 1, 3, groups, function(){});

            engine.reportWin(9, 3, 2, groups, function(){});
            engine.reportWin(10, 5, 3, groups, function(){});
            //action
            engine.getUnreportableMatches(groups, unreportCallbackSpy);
            //assert
            assert.equal(unreportCallbackSpy.calledOnce, true);
            assert.equal(unreportCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(unreportCallbackSpy.getCall(0).args[1], [{round:3, group:2, number:10, complete:true, player1:{name:'cole', loss:1, lossCount:6, win:2, winCount:8}, player2:{name:'patrick', loss:2, lossCount:9, win:1, winCount:6}, player1Score:5, player2Score:3}]);
        });
    });

    describe('getPlayersOrderedByScore', function(){
        it('should return an error if the players list does not exist', function(){
            //setup
            var getPlayersOrderedByScoreCallback = sinon.spy();
            //action
            engine.getPlayersOrderedByScore({}, getPlayersOrderedByScoreCallback);
            //assert
            assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
            assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0].message, 'playersNotFound');
        });

        it('should return an error if the number of players in the group is higher than expected', function(){
            //setup
            var getPlayersOrderedByScoreCallback = sinon.spy();
            var group = {players:[john, cole, patrick, alice, giulietta]};
            //action
            engine.getPlayersOrderedByScore(group, getPlayersOrderedByScoreCallback);
            //assert
            assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
            assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0].message, 'tooManyPlayers');
        });

        it('should return an error if the number of players is lower than expected', function(){
            //setup
            var getPlayersOrderedByScoreCallback = sinon.spy();
            var group = {players:[john, cole, patrick]};
            //action
            engine.getPlayersOrderedByScore(group, getPlayersOrderedByScoreCallback);
            //assert
            assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
            assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0].message, 'tooFewPlayers');
        });

        it('should return an ordered list of players based on their goal-average (all no-matches)', function(){
            //setup
            var getPlayersOrderedByScoreCallback = sinon.spy();
            var group = {players:[john, cole, patrick, alice]};
            group.players[3].winCount = 4;
            group.players[3].lossCount = 0;
            group.players[2].winCount = 4;
            group.players[2].lossCount = 2;
            group.players[0].winCount = 2;
            group.players[0].lossCount = 4;
            group.players[1].winCount = 0;
            group.players[1].lossCount = 4;
            //action
            engine.getPlayersOrderedByScore(group, getPlayersOrderedByScoreCallback);
            //assert
            assert.equal(getPlayersOrderedByScoreCallback.calledOnce, true);
            assert.equal(getPlayersOrderedByScoreCallback.getCall(0).args[0], null);
            assert.deepEqual(getPlayersOrderedByScoreCallback.getCall(0).args[1], [alice, patrick, john, cole]);
        });
    });

    describe('getWinnersFromGroup', function(){
        it('should return the winners of a group if all matches have been played', function(){
            //setup
            var getWinnersFropGroupCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, function(){});
            engine.reportWin(2, 2, 0, groups, function(){});
            engine.reportWin(3, 2, 0, groups, function(){});
            engine.reportWin(4, 2, 0, groups, function(){});
            engine.reportWin(5, 2, 0, groups, function(){});
            //action
            engine.getWinnersFromGroup(groups[1], engine, getWinnersFropGroupCallbackSpy);
            //assert
            assert.equal(getWinnersFropGroupCallbackSpy.calledOnce, true);
            assert.equal(getWinnersFropGroupCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(getWinnersFropGroupCallbackSpy.getCall(0).args[1], [john, jane]);
        });

        it('should return an empty array if matches are not over for the current group', function(){
            //setup
            var getWinnersFropGroupCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.reportWin(1, 2, 0, groups, function(){});
            engine.reportWin(2, 2, 0, groups, function(){});
            engine.reportWin(3, 2, 0, groups, function(){});
            engine.reportWin(4, 2, 0, groups, function(){});
            //action
            engine.getWinnersFromGroup(groups[1], engine, getWinnersFropGroupCallbackSpy);
            //assert
            assert.equal(getWinnersFropGroupCallbackSpy.calledOnce, true);
            assert.equal(getWinnersFropGroupCallbackSpy.getCall(0).args[0], null);
            assert.deepEqual(getWinnersFropGroupCallbackSpy.getCall(0).args[1], []);
        });

        it('should bubble incoming errors up to the caller', function(){
            //setup
            var getWinnersFropGroupCallbackSpy = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            engine.getPlayersOrderedByScore = function(data, callback){
                callback({message:'someError'});
            };
            //action
            engine.getWinnersFromGroup(groups[1], engine, getWinnersFropGroupCallbackSpy);
            //assert
            assert.equal(getWinnersFropGroupCallbackSpy.calledOnce, true);
            assert.equal(getWinnersFropGroupCallbackSpy.getCall(0).args[0].message, 'someError');
        });
    });

    describe('winners', function(){
        it('should return an empty array if there are no finished groups', function(){
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

        it('should return an array w/ the winners of group 1 if group1 is over', function(){
            //setup
            var winnersCallback = sinon.spy();
            engine.initBracket([john, jane, bob, alice], initBracketCallback);
            bob.winCount = 1;
            alice.winCount = 1;
            groups[1].matches[5].player1 = bob;
            groups[1].matches[5].player2 = alice;
            groups[1].matches[5].complete = true;
            //action
            engine.winners(groups, winnersCallback);
            //assert
            assert.equal(winnersCallback.calledOnce, true);
            assert.equal(winnersCallback.getCall(0).args[0], null);
            assert.deepEqual(winnersCallback.getCall(0).args[1], [bob, alice]);
        });

        it('should return an array w/ only the winners of group 2 if group2 is over but not group1', function(){
            //setup
            var winnersCallback = sinon.spy();
            engine.initBracket([john, jane, bob, alice, cole, franz, giulietta, peter], initBracketCallback);
            peter.winCount = 1;
            franz.winCount = 1;
            groups[2].matches[10].player1 = peter;
            groups[2].matches[10].player2 = franz;
            groups[2].matches[10].complete = true;
            //action
            engine.winners(groups, winnersCallback);
            //assert
            assert.equal(winnersCallback.calledOnce, true);
            assert.equal(winnersCallback.getCall(0).args[0], null);
            assert.deepEqual(winnersCallback.getCall(0).args[1], [franz, peter]);
        });
    });
});