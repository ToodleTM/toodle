'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SimplePool = require('../../../lib/gameRules/simpleGSLPools').Engine;

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

    beforeEach(function () {
        engine = new SimplePool();
        callbackSpy = sinon.spy(function (err, data) {
            actualBracket = data;
        });
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
            //action
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(0).args[0], null);
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].players, [john, jane, bob, alice]);
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[1], {
                player1: john,
                player2: alice,
                number: 1,
                round: 1,
                group: '1'
            });
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[2], {
                player1: jane,
                player2: bob,
                number: 2,
                round: 1,
                group: '1'
            });
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

        it('should give a unique match identifier to each match in-between the groups', function () {
            //setup
            var callbackSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];

            //action
            engine.initBracket(players, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(0).args[0], null);
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[1], {
                player1: john,
                player2: alice,
                number: 1,
                round: 1,
                group: '1'
            });
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[2], {
                player1: jane,
                player2: bob,
                number: 2,
                round: 1,
                group: '1'
            });
            assert.equal(callbackSpy.getCall(0).args[1][1].matches[3], null);
            assert.equal(callbackSpy.getCall(0).args[1][1].matches[4], null);

            assert.deepEqual(callbackSpy.getCall(0).args[1][2].matches[6], {
                player1: cole,
                player2: patrick,
                number: 6,
                round: 1,
                group: '2'
            });
            assert.deepEqual(callbackSpy.getCall(0).args[1][2].matches[7], {
                player1: peter,
                player2: franz,
                number: 7,
                round: 1,
                group: '2'
            });
        });
    });

    describe('reportwin', function () {
        var groups = {};
        var initBracketCallback = function (error, generatedGroups) {
            groups = generatedGroups;
        };
        beforeEach(function () {
            groups = {};
        });

        it('should return an error if the two scores are equal', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(1, 2, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0].message, 'winnerMustHaveHigherScore');
        });

        it('should return an error if the 1st score is invalid', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(1, null, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0].message, 'invalidScores');
        });

        it('should return an error if the 1st score is invalid', function () {
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(1, 2, null, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0].message, 'invalidScores');
        });

        it('should update match information when reporting', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(1, 2, 0, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0], null);
            assert.deepEqual(reportWinSpy.getCall(0).args[1][1].matches[1], {player1Score:2, player2Score:0, complete:true, round:1, player1:john, player2:alice, group:'1', number:1});
        });

        it('should return an error if match to report could not be found', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(123, 2, 0, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0].message, 'notFound');
        });

        it('should not allow reporting if match is already complete', function(){
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

        it('should move the winner of the 1st round1 match to the round2 s winner match player1 slot', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0], null);
            assert.deepEqual(groups[1].matches[3].player1, alice);
            assert.deepEqual(groups[1].matches[3].round, 2);
            assert.deepEqual(groups[1].matches[3].group, '1');
        });

        it('should move the loser of the 1st round1 match to the round2 s loser match player1 slot', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0], null);
            assert.deepEqual(groups[1].matches[4].player1, john);
            assert.deepEqual(groups[1].matches[4].round, 2);
            assert.deepEqual(groups[1].matches[4].group, '1');
        });

        it('should move the winner of the 2nd round1 match to the round2 s winner match player2 slot', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0], null);
            assert.deepEqual(groups[1].matches[3].player2, bob);
            assert.deepEqual(groups[1].matches[3].round, 2);
            assert.deepEqual(groups[1].matches[3].group, '1');
        });

        it('should move the winner of the 2nd round1 match to the round2 s winner match player2 slot', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            //action
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            //assert
            assert.equal(reportWinSpy.getCall(0).args[0], null);
            assert.deepEqual(groups[1].matches[4].player2, jane);
            assert.deepEqual(groups[1].matches[4].round, 2);
            assert.deepEqual(groups[1].matches[4].group, '1');
        });

        it('should put the loser of round 2 s winner match into the 1st slot of the decider match', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(3, 0, 2, groups, reportWinSpy);
            //assert
            assert.deepEqual(groups[1].matches[5].player1, alice);
            assert.deepEqual(groups[1].matches[5].round, 3);
            assert.deepEqual(groups[1].matches[5].group, '1');
        });

        it('should put the winner of round 2 s loser match into the 2nd slot of the decider match', function(){
            //setup
            var reportWinSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick];
            engine.initBracket(players, initBracketCallback);
            engine.reportWin(1, 0, 2, groups, reportWinSpy);
            engine.reportWin(2, 0, 2, groups, reportWinSpy);
            //action
            engine.reportWin(4, 0, 2, groups, reportWinSpy);
            //assert
            assert.deepEqual(groups[1].matches[5].player2, jane);
            assert.deepEqual(groups[1].matches[5].round, 3);
            assert.deepEqual(groups[1].matches[5].group, '1');
        });

        it('should correctly set both players of the decider match when all previous matches have been played out', function(){
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
            assert.deepEqual(groups[1].matches[5].group, '1');
        });

        describe('if some or all round 1 matches have not been played', function(){

            function testIncompleteRound1(matchNumberToTest, matchNumberToCheck){
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
            it('should return an error if trying to report round2 s winner match (round1 1st match incomplete)', function(){
                testIncompleteRound1(2,3);
            });

            it('should return an error if trying to report round2 s winner match (round1 2nd match incomplete)', function(){
                testIncompleteRound1(1,3);
            });

            it('should return an error if trying to report round2 s loser match (round1 1st match incomplete)', function(){
                testIncompleteRound1(2,4);
            });

            it('should return an error if trying to report round2 s loser match (round1 2nd match incomplete)', function(){
                testIncompleteRound1(1,4);
            });
        });
    });

    describe('getMatchByNumber', function () {
        function getMatchByNumberTest(groups, matchNumber, expectedMatchValue){
            //action
            var actual = engine.getMatchByNumber(groups, matchNumber);
            //assert
            assert.deepEqual(actual, expectedMatchValue);
        }
        it('should return null if no groups are specified', function () {
            getMatchByNumberTest(null, null, null);
        });

        it('should return null if matchNumber is NaN', function(){
            getMatchByNumberTest({1:{matches:{2:{player1:'p1'}}}}, 'dfb', null);
        });

        it('should return match 2 from the 1st group if match id is 2', function(){
            getMatchByNumberTest({1:{matches:{2:{player1:'p1'}}}}, 2, {player1:'p1'});
        });

        it('should return match 5 from the 1st group if match id is 5', function(){
            getMatchByNumberTest({1:{matches:{5:{player1:'p1'}}}}, 5, {player1:'p1'});
        });

        it('should return match 1 from the 1st group if match id is 6', function(){
            getMatchByNumberTest({2:{matches:{6:{player1:'p1'}}}}, 6, {player1:'p1'});
        });

        it('should return match 12 located in group 3 if match id is 12', function(){
            getMatchByNumberTest({1:{matches:{2:{player1:'p1'}}}, 3:{matches:{12:{player1:'p12'}, 13:{player1:'p13'}}}}, 12, {player1:'p12'});
        });

        it('should return null if match id is 0', function(){
            getMatchByNumberTest({1:{matches:{2:{player1:'p1'}}}, 3:{matches:{12:{player1:'p12'}, 13:{player1:'p13'}}}}, 0, null);
        });

        it('should return null if match id is negative', function(){
            getMatchByNumberTest({1:{matches:{2:{player1:'p1'}}}, 3:{matches:{12:{player1:'p12'}, 13:{player1:'p13'}}}}, -42, null);
        });

        it('should return null when requesting a group that does not exist', function(){
            getMatchByNumberTest({1:{matches:{2:{player1:'p1'}}}, 3:{matches:{12:{player1:'p12'}, 13:{player1:'p13'}}}}, 1234, null);
        });
    });
});