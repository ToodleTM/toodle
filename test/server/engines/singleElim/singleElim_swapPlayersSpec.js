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
        if (data) {
            actualBracket = JSON.parse(JSON.stringify(data));
        } else {
            actualBracket = null;
        }
    });
});

describe('SingleElim - SwapPlayers', function () {
    it('should return an error if match1 has not been found', function () {
        //setup
        var callbackSpy = sinon.spy();
        //action
        engine.swapPlayers(null, null, null, null, null, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerMatchNotFound'});
    });

    it('should return an error if match2 has not been found', function () {
        //setup
        var callbackSpy = sinon.spy();
        //action
        engine.swapPlayers({}, null, null, null, null, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerMatchNotFound'});
    });

    function testSwapNullPlayers(player1InMatch1, player2InMatch1, player1InMatch2, player2InMatch2, match1Selector, match2Selector, expectedMatch1P1, expectedMatch1P2, expectedMatch2P1, expectedMatch2P2) {
        //setup
        var callbackSpy = sinon.spy();
        var bracket = {
            '1': {
                'next': 3,
                'nextFirst': true,
                'number': 1,
                'player1': player1InMatch1,
                'player2': player2InMatch1,
                'round': 2
            },
            '2': {
                'next': 3,
                'nextSecond': true,
                'number': 2,
                'player1': player1InMatch2,
                'player2': player2InMatch2,
                'round': 2
            }
        };
        //action
        engine.swapPlayers({
            number: 1,
            player1: player1InMatch1,
            player2: player2InMatch1
        }, match1Selector, {
            number: 2,
            player1: player1InMatch2,
            player2: player2InMatch2
        }, match2Selector, bracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.equal(callbackSpy.getCall(0).args[0], null);
        assert.deepEqual(callbackSpy.getCall(0).args[1], {
            '1': {
                'next': 3,
                'nextFirst': true,
                'number': 1,
                'player1': expectedMatch1P1,
                'player2': expectedMatch1P2,
                'round': 2
            },
            '2': {
                'next': 3,
                'nextSecond': true,
                'number': 2,
                'player1': expectedMatch2P1,
                'player2': expectedMatch2P2,
                'round': 2
            }
        });
    }

    it('should be able to swap an empty slot in match1 with an actual player in match2 (player1 selected in both matches)', function () {
        testSwapNullPlayers(null, jane, john, null, 'player1', 'player1',
            john, jane, null, null);
    });

    it('should be able to swap an empty slot in match2 with an actual player in match1 (player2 selected in both matches)', function () {
        testSwapNullPlayers(null, jane, bob, null, 'player2', 'player2',
            null, null, bob, jane);
    });

    it('should be able to swap an empty slot in match1 with an actual player in match2 (player1 / player2)', function () {
        testSwapNullPlayers(null, john, null, bob, 'player1', 'player2',
            bob, john, null, null);
    });

    it('should be able to swap an empty slot in match1 with an actual player in match2 (player2 / player1)', function () {
        testSwapNullPlayers(john, null, jane, null, 'player2', 'player1',
            john, jane, null, null);
    });

    it('should swap two players between matches if both matches are valid and players can be found', function () {
        //setup
        var callbackSpy = sinon.spy();
        var bracket = {};
        engine.initBracket([john, jane, bob, alice], function (error, data) {
            bracket = data;
        });
        //action
        engine.swapPlayers({number: 1, player1: john}, 'player1', {
            number: 2,
            player2: alice
        }, 'player2', bracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], null);
        assert.deepEqual(callbackSpy.getCall(0).args[1],
            {
                '1': {
                    'next': 3,
                    'nextFirst': true,
                    'number': 1,
                    'player1': alice,
                    'player2': jane,
                    'round': 2
                },
                '2': {
                    'next': 3,
                    'nextSecond': true,
                    'number': 2,
                    'player1': bob,
                    'player2': john,
                    'round': 2
                },
                '3': {
                    'number': 3,
                    'player1': null,
                    'player2': null,
                    'round': 1
                }
            }
        );
    });
});



