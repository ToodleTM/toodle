'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SimpleGSLGroups = require('../../../../lib/engines/simpleGSLGroups').Engine;


var engine, callbackSpy;
var john = {name: 'john'};
var jane = {name: 'jane'};
var bob = {name: 'bob'};
var alice = {name: 'alice'};

beforeEach(function () {
    engine = new SimpleGSLGroups();

});

describe('SimpleGSLGroups - Defwin / forfeit', function () {
    var recalledTournamentData = {};
    beforeEach(function () {
        callbackSpy = sinon.spy(function (err, data) {
            recalledTournamentData = {};
            //some copying shenanigans to ensure than when the bracket structure is used w/ forfeit, it does not share references from the initial object (simulates DB recall between API calls)
            if (data) {
                recalledTournamentData = JSON.parse(JSON.stringify(data));
            }
        });
        engine.initBracket([john, jane, bob, alice], callbackSpy);
    });
    describe('forfeit mechanics', function () {
        it('should return an error if match cannot be found', function () {
            //setup
            //action
            engine.forfeit(7, 1, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'cantDefwinMatchNotFound');
        });
        it('should return an error if slot number is not valid', function () {
            //setup
            //action
            engine.forfeit(1, 7, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'cantDefwinInvalidSlot');
        });
        it('should return an error if match is already complete', function () {
            //setup
            engine.reportWin(1, 1, 2, recalledTournamentData, true, callbackSpy);
            //action
            engine.forfeit(1, 1, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(2).args[0].message, 'cantDefwinMatchIsComplete');
        });
        it('should flag the match as "forfeit" & "complete" if match exists (1st slot = forfeit)', function () {
            //setup
            //action
            engine.forfeit(1, 1, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].complete, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].forfeit, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].winner, 2);
        });
        it('should flag the match as "forfeit" & "complete" if match exists (2nd slot = forfeit)', function () {
            //setup
            //action
            engine.forfeit(1, 2, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].complete, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].forfeit, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].winner, 1);
        });
        it('should move non-forfeit player of match 1 to the winners match and the other to the losers match', function () {
            //setup
            //action
            engine.forfeit(1, 2, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[3].player1, {
                'loss': 0,
                'lossCount': 2,
                'name': 'john',
                'win': 1,
                'winCount': 2
            });
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[4].player1, {
                'loss': 1,
                'lossCount': 2,
                'name': 'alice',
                'win': 0,
                'winCount': 2
            });
        });
        it('should move non-forfeit player of match 2 to the winners match and the other to the losers match', function () {
            //setup
            //action
            engine.forfeit(2, 2, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[3].player2, {
                'loss': 0,
                'lossCount': 2,
                'name': 'jane',
                'win': 1,
                'winCount': 2
            });
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[4].player2, {
                'loss': 1,
                'lossCount': 2,
                'name': 'bob',
                'win': 0,
                'winCount': 2
            });
        });
        it('should move the winner\'s match forfeit player to the deciding match', function () {
            //setup
            engine.forfeit(1, 2, 2, 2, recalledTournamentData, callbackSpy);
            engine.forfeit(2, 2, 2, 2, recalledTournamentData, callbackSpy);
            //action
            engine.forfeit(3, 2, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(3).args[0], null);
            assert.deepEqual(callbackSpy.getCall(3).args[1][1].matches[5].player1, {
                'loss': 1,
                'lossCount': 4,
                'name': 'jane',
                'win': 1,
                'winCount': 4
            });
        });
        it('should move the loser\'s match winner to the deciding match', function () {
            //setup
            engine.forfeit(1, 2, 2, 2, recalledTournamentData, callbackSpy);
            engine.forfeit(2, 2, 2, 2, recalledTournamentData, callbackSpy);
            //action
            engine.forfeit(4, 2, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(3).args[0], null);
            assert.deepEqual(callbackSpy.getCall(3).args[1][1].matches[5].player2, {
                'loss': 1,
                'lossCount': 4,
                'name': 'alice',
                'win': 1,
                'winCount': 4
            });
        });
        it('should count a forfeit as a loss in the group list', function(){
            //setup
            //action
            engine.forfeit(1, 1, 2, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].players[3], {
                'loss': 0,
                'lossCount': 2,
                'name': 'alice',
                'win': 1,
                'winCount': 2
            });
        });
        //peut être une règle à ajouter sur le forfait d'un match sans les 2 joueurs ... ou pas ?
    });
    describe('score updates', function () {
        it('should save the current score of a forfeit', function () {
            //setup
            //action
            engine.forfeit(1, 1, 3, 2, recalledTournamentData, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].complete, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].forfeit, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].winner, 2);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].score1, 3);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].matches[1].score2, 2);
        });
    });
});