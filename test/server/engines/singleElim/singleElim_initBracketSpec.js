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
        if (data) {
            actualBracket = JSON.parse(JSON.stringify(data));
        } else {
            actualBracket = null;
        }
    });
});


describe('SingleElim - Bracket init', function () {
    function initBracketTest(expectedBracketLength, playersArray) {
        //setup
        playersArray = playersArray || null;
        expectedBracketLength = expectedBracketLength || 0;
        //action
        engine.initBracket(playersArray, callbackSpy);
        //assert
        assert.equal(Object.keys(actualBracket).length, expectedBracketLength);
    }



    describe('Create the first matches', function () {
        it('should return an error if no player is available to create the bracket', function () {
            //setup
            var callbackSpy = sinon.spy();
            //action
            engine.initBracket([], callbackSpy);
            //assert
            assert.equal(callbackSpy.calledOnce, true);
            assert.deepEqual(callbackSpy.getCall(0).args, [{message: 'notEnoughPlayers'}]);
        });

        it('should return an error if only one player is available to create the bracket', function () {
            //setup
            var callbackSpy = sinon.spy();
            //action
            engine.initBracket([bob], callbackSpy);
            //assert
            assert.equal(callbackSpy.calledOnce, true);
            assert.deepEqual(callbackSpy.getCall(0).args, [{message: 'notEnoughPlayers'}]);
        });

        it('should pair players as they come into as many matches as needed', function () {
            initBracketTest(3, [john, jane, bob, alice]);
        });
        describe('should be able to determine the bracket size based on the amount of players', function () {
            it('should provide a size 8 bracket if player number is between 5 and 8', function () {
                //setup
                //action
                var actual = engine.defineBracketSize(5);
                //assert
                assert.equal(actual, 8);
            });

            it('should provide a size 1 bracket for 1 player', function () {
                var actual = engine.defineBracketSize(1);
                //assert
                assert.equal(actual, 1);
            });


            it('should provide a size 4 bracket for 4 players', function () {
                var actual = engine.defineBracketSize(4);
                //assert
                assert.equal(actual, 4);
            });
        });
        describe('should be able to handle odd amounts of players', function () {
            it('should be able to equally position 5 people in an 8 slot bracket', function () {
                //setup
                var engine = new SingleElim();
                var actual = null;
                var callbackSpy = sinon.spy(function (err, data) {
                    actual = data;
                });
                //action
                engine.initBracket([john, jane, bob, alice, franz], callbackSpy);
                //assert
                assert.equal(Object.keys(actual).length, 7);
                assert.equal(actual[1].player1.name, 'john');
                assert.equal(actual[1].player2, null);
                assert.equal(actual[2].player1.name, 'jane');
                assert.equal(actual[2].player2.name, 'bob');
                assert.equal(actual[3].player1, null);
                assert.equal(actual[3].player2.name, 'alice');
                assert.equal(actual[4].player1, null);
                assert.equal(actual[4].player2.name, 'franz');
            });

        });

        it('should number each match to ease lookup', function () {
            //setup
            var engine = new SingleElim();
            var actual = null;
            var callbackSpy = sinon.spy(function (err, data) {
                actual = data;
            });
            //action
            engine.initBracket([john, jane, bob, alice, franz], callbackSpy);
            //assert
            assert.equal(Object.keys(actual).length, 7);
            assert.equal(actual[1].number, 1);
            assert.equal(actual[2].number, 2);
            assert.equal(actual[3].number, 3);
            assert.equal(actual[4].number, 4);
        });
    });
    describe('create subsequent matches', function () {
        it('should create the subsequent match for a 2-match bracket', function () {
            //action
            engine.initBracket([john, jane, bob, alice], callbackSpy);
            //assert
            assert.equal(Object.keys(actualBracket).length, 3);
            assert.equal(actualBracket[3].number, 3);
            assert.equal(actualBracket[3].player1, null);
            assert.equal(actualBracket[3].player2, null);
        });

        it('should be able to handle multiple levels of upcoming matches', function () {
            //action
            engine.initBracket([john, jane, bob, alice, peter, franz, cole, patrick], callbackSpy);
            //assert
            assert.equal(Object.keys(actualBracket).length, 7);
            assert.equal(actualBracket[5].number, 5);
            assert.equal(actualBracket[5].player1, null);
            assert.equal(actualBracket[5].player2, null);
            assert.equal(actualBracket[6].number, 6);
            assert.equal(actualBracket[6].player1, null);
            assert.equal(actualBracket[6].player2, null);
            assert.equal(actualBracket[7].number, 7);
            assert.equal(actualBracket[7].player1, null);
            assert.equal(actualBracket[7].player2, null);
        });
    });
    describe('link matches', function () {
        it('should indicate next match number for each match', function () {
            //action
            engine.initBracket([john, jane, bob, alice, peter, franz, cole, patrick], callbackSpy);
            //assert
            assert.equal(actualBracket[1].next, 5);
            assert.equal(actualBracket[2].next, 5);
            assert.equal(actualBracket[3].next, 6);
            assert.equal(actualBracket[4].next, 6);

            assert.equal(actualBracket[5].next, 7);
            assert.equal(actualBracket[6].next, 7);
            assert.equal(actualBracket[7].next, null);
        });
    });
    describe('Additonal operations on init', function () {
        it('should update upcoming matches upon initialization if there are empty slots', function () {
            //setup / action
            engine.initBracket([john, jane, bob, alice, franz], callbackSpy);
            //assert
            assert.equal(actualBracket[5].player1.name, 'john');
            assert.equal(actualBracket[5].player2, null);
            assert.equal(actualBracket[6].player1.name, 'alice');
            assert.equal(actualBracket[6].player2.name, 'franz');
            assert.equal(actualBracket[1].complete, true);
            assert.equal(actualBracket[3].complete, true);
            assert.equal(actualBracket[4].complete, true);
        });

        it('should register the round number of a match upon initialization', function () {
            //setup / action
            engine.initBracket([john, jane, bob, alice, franz], callbackSpy);
            //assert
            assert.equal(actualBracket[1].round, 4);
            assert.equal(actualBracket[2].round, 4);
            assert.equal(actualBracket[3].round, 4);
            assert.equal(actualBracket[4].round, 4);
            assert.equal(actualBracket[5].round, 2);
            assert.equal(actualBracket[6].round, 2);
            assert.equal(actualBracket[7].round, 1);

        });
    });
});