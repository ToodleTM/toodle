var assert = require('chai').assert;
var sinon = require('sinon');
var SingleElim = require('../../../lib/gameRules/singleElim').Engine;

describe('SingleElim engine', function () {
    var engine, callbackSpy, actual;
    var john = {name: 'john'};
    var jane = {name: 'jane'};
    var bob = {name: 'bob'};
    var alice = {name: 'alice'};
    var peter = {name: 'peter'};
    var franz = {name: 'franz'};
    var cole = {name: 'cole'};
    var patrick = {name: 'patrick'};

    beforeEach(function () {
        engine = new SingleElim;
        callbackSpy = sinon.spy(function (err, data) {
            actual = data;
        });
    });

    describe('initBracket', function () {
        function initBracketTest(expectedBracketLength, playersArray) {
            //setup
            playersArray = playersArray || null;
            expectedBracketLength = expectedBracketLength || 0;
            //action
            engine.initBracket(playersArray, callbackSpy);
            //assert
            assert.equal(Object.keys(actual).length, expectedBracketLength);
        }

        describe('Create the first matches', function () {
            it('should return an empty bracket if no players are submitted', function () {
                initBracketTest(0, null);
            });

            it('should return a bracket of size 1 if 1 player submitted', function () {
                initBracketTest(1, [
                    {name: 'john'}
                ]);
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
                assert.equal(Object.keys(actual).length, 3);
                assert.equal(actual[3].number, 3);
                assert.equal(actual[3].player1, null);
                assert.equal(actual[3].player2, null);
            });

            it('should be able to handle multiple levels of upcoming matches', function () {
                //action
                engine.initBracket([john, jane, bob, alice, peter, franz, cole, patrick], callbackSpy);
                //assert
                assert.equal(Object.keys(actual).length, 7);
                assert.equal(actual[5].number, 5);
                assert.equal(actual[5].player1, null);
                assert.equal(actual[5].player2, null);
                assert.equal(actual[6].number, 6);
                assert.equal(actual[6].player1, null);
                assert.equal(actual[6].player2, null);
                assert.equal(actual[7].number, 7);
                assert.equal(actual[7].player1, null);
                assert.equal(actual[7].player2, null);
            });
        });
        describe('link matches', function () {
            it('should indicate next match number for each match', function () {
                //action
                engine.initBracket([john, jane, bob, alice, peter, franz, cole, patrick], callbackSpy);
                //assert
                assert.equal(actual[1].next, 5);
                assert.equal(actual[2].next, 5);
                assert.equal(actual[3].next, 6);
                assert.equal(actual[4].next, 6);

                assert.equal(actual[5].next, 7);
                assert.equal(actual[6].next, 7);
                assert.equal(actual[7].next, null);
            });
        });
        describe('Additonal operations on init', function () {
            it('should update upcoming matches upon initialization if there are empty slots', function(){
                //setup / action
                engine.initBracket([john, jane, bob, alice, franz], callbackSpy);
                //assert
                assert.equal(actual[5].player1.name, 'john');
                assert.equal(actual[5].player2, null);
                assert.equal(actual[6].player1.name, 'alice');
                assert.equal(actual[6].player2.name, 'franz');
                assert.equal(actual[1].complete, true);
                assert.equal(actual[3].complete, true);
                assert.equal(actual[4].complete, true);
            });

            it('should register the round number of a match upon initialization', function(){
                //setup / action
                engine.initBracket([john, jane, bob, alice, franz], callbackSpy);
                //assert
                assert.equal(actual[1].round, 4);
                assert.equal(actual[2].round, 4);
                assert.equal(actual[3].round, 4);
                assert.equal(actual[4].round, 4);
                assert.equal(actual[5].round, 2);
                assert.equal(actual[6].round, 2);
                assert.equal(actual[7].round, 1);

            });
        });
    });
    describe('Match reporting', function () {
        describe('Unreport match', function () {
            it('should be able to unreport a match and update the bracket accordingly', function () {
                //setup
                engine.initBracket([john, jane, bob, alice], callbackSpy);
                actual[1].score1 = 2;
                actual[1].score2 = 0;
                actual[1].complete = true;
                actual[3].player1 = john;
                //action
                engine.unreport(1, actual, callbackSpy);
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
                engine.reportWin(1, 2, 0, actual, callbackSpy);
                engine.reportWin(2, 2, 0, actual, callbackSpy);
                engine.reportWin(3, 2, 0, actual, callbackSpy);
                engine.reportWin(4, 2, 0, actual, callbackSpy);
                engine.reportWin(5, 2, 0, actual, callbackSpy);
                var unreportCallbackSpy = sinon.spy(function (error, data) {
                });
                //action
                engine.unreport(1, actual, unreportCallbackSpy);
                //assert
                assert.equal(unreportCallbackSpy.getCall(0).args[0].message, 'nextMatchAlreadyReported');
            });
            it('should only allow unreport of completed matches', function () {
                //setup
                engine.initBracket([john, jane, bob, alice], callbackSpy);
                //action
                engine.unreport(3, actual, callbackSpy);
                //assert
                assert.equal(callbackSpy.getCall(1).args[0].message, 'cantUnreportIncompleteMatch');
            });
        });
        describe('Report match', function () {
            it('should update next match with match winner', function () {
                //setup
                engine.initBracket([john, jane, bob, alice, peter], callbackSpy);
                //action
                engine.reportWin(2, 2, 0, actual, callbackSpy);

                //assert
                assert.equal(actual[5].player2.name, 'jane');
                assert.equal(actual[2].complete, true);
                assert.equal(actual[2].score1, 2);
                assert.equal(actual[2].score2, 0);
            });

            it('should update the right slot of upcoming match', function () {
                //setup
                engine.initBracket([john, jane, bob, alice, peter], callbackSpy);
                //action
                engine.reportWin(2, 2, 0, actual, callbackSpy);
                //assert
                assert.equal(actual[5].player1.name, 'john');
                assert.equal(actual[5].player2.name, 'jane');
            });

            it('should update next match with winners from both related matches', function () {
                //setup
                engine.initBracket([john, jane, bob, alice, peter, franz, cole], callbackSpy);
                //action
                engine.reportWin(2, 0, 2, actual, callbackSpy);
                engine.reportWin(1, 2, 0, actual, callbackSpy);

                //assert
                assert.equal(actual[5].player1.name, 'john');
                assert.equal(actual[5].player2.name, 'alice');
                assert.equal(actual[1].complete, true);
                assert.equal(actual[2].complete, true);
            });

            it('should not allow reporting an already reported match', function () {
                //setup
                engine.initBracket([john, jane, bob, alice, peter, franz, cole, patrick], callbackSpy);
                engine.reportWin(1, 2, 0, actual, callbackSpy);
                //action
                engine.reportWin(1, 0, 2, actual, callbackSpy);

                //assert
                assert.equal(callbackSpy.getCall(1).args[0], null);
                assert.equal(Object.keys(callbackSpy.getCall(1).args[1]).length, 7);
                assert.equal(callbackSpy.getCall(2).args[0].message, 'alreadyReported');
            });
            it('should be able to tell if a tournament bracket is over', function () {
                //setup
                engine = new SingleElim;
                reportWinCallbackSpy = sinon.spy(function (err, data) {
                    actual = data;
                });
                engine.initBracket([john, jane], callbackSpy);
                //action
                engine.reportWin(1, 0, 2, actual, reportWinCallbackSpy);

                //assert
                assert.equal(reportWinCallbackSpy.getCall(0).args[0], null);
                assert.equal(Object.keys(reportWinCallbackSpy.getCall(0).args[1]).length, 1);
                assert.equal(reportWinCallbackSpy.getCall(0).args[2], true);
            });

            it('should be able to tell if a tournament bracket is not over', function () {
                //setup
                engine.initBracket([john, jane, bob, alice, peter], callbackSpy);
                //action
                engine.reportWin(1, 2, 0, actual, callbackSpy);
                //assert
                assert.equal(callbackSpy.getCall(1).args[2], false);
            });
        });
    });
});


