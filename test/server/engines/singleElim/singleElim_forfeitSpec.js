'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SingleElim = require('../../../../lib/engines/singleElim').Engine;


var engine, callbackSpy, actualBracket;
var john = {name: 'john'};
var jane = {name: 'jane'};
var bob = {name: 'bob'};
var alice = {name: 'alice'};

beforeEach(function () {
    engine = new SingleElim();
    callbackSpy = sinon.spy(function (err, data) {
        actualBracket = data;
    });
});

describe('SingleElim - Defwin / forfeit', function () {
    describe('forfeit mechanics', function () {
        it('should return an error if match cannot be found', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.forfeit(7, 1, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'cantDefwinMatchNotFound');
        });
        it('should return an error if slot number is not valid', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.forfeit(1, 7, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0].message, 'cantDefwinInvalidSlot');
        });
        it('should return an error if match is already complete', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            engine.reportWin(1, 1, 2, actualBracket, true, callbackSpy);
            //action
            engine.forfeit(1, 1, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(2).args[0].message, 'cantDefwinMatchIsComplete');
        });
        it('should flag the match as "forfeit" & "complete" if match exists (1st slot = forfeit)', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.forfeit(1, 1, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].complete, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].forfeit, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].winner, 2);
        });
        it('should flag the match as "forfeit" & "complete" if match exists (2nd slot = forfeit)', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.forfeit(1, 2, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].complete, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].forfeit, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].winner, 1);
        });
        it('should update next match 1st slot w/ the non-forfeit player if forfeit-ed match leads to a 1st slot in upcoming match', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.forfeit(1, 2, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][3].player1, john);
        });
        it('should update next match 2nd slot w/ the non-forfeit player if forfeit-ed match leads to a 2nd slot in upcoming match', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.forfeit(2, 2, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][3].player2, bob);
        });
        it('should not update next match if there is no next match to update', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            engine.forfeit(1, 2,  2, 2, actualBracket, callbackSpy);
            engine.forfeit(2, 2,  2, 2, actualBracket, callbackSpy);
            //action
            engine.forfeit(3, 2, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.equal(callbackSpy.getCall(1).args[1][1].forfeit, true);
            assert.equal(callbackSpy.getCall(2).args[0], null);
            assert.equal(callbackSpy.getCall(2).args[1][1].forfeit, true);
            assert.equal(callbackSpy.getCall(3).args[0], null);
            assert.equal(callbackSpy.getCall(3).args[1][1].forfeit, true);
            assert.deepEqual(callbackSpy.getCall(3).args[1][3].player1, john);
            assert.deepEqual(callbackSpy.getCall(3).args[1][3].player2, bob);
        });
    });
    describe('score updates', function () {
        it('should save the current score of a forfeit', function () {
            //setup
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //action
            engine.forfeit(1, 1, 2, 2, actualBracket, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(1).args[0], null);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].complete, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].forfeit, true);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].winner, 2);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].score1, 2);
            assert.deepEqual(callbackSpy.getCall(1).args[1][1].score2, 2);
        });
    });
});