var assert = require('chai').assert;
var sinon = require('sinon');
var SingleElim = require('../../../lib/gameRules/singleElim').SingleElim;

describe('SingleElim engine', function () {

    describe('initBracket', function () {
        function initBracketTest(expectedBracketLength, playersArray) {
            //setup
            playersArray = playersArray || null;
            expectedBracketLength = expectedBracketLength || 0;
            var engine = new SingleElim();
            var actual = null;
            var callbackSpy = sinon.spy(function(err, data){
                actual = data;
            });
            //action
            engine.initBracket(playersArray, callbackSpy);
            //assert
            assert.equal(actual.length, expectedBracketLength);
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
                initBracketTest(3, [
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'}
                ]);
            });

            it('should be able to handle odd amounts of players', function () {
                //setup
                var engine = new SingleElim();
                var actual = null;
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });
                //action
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'anton'}
                ], callbackSpy);
                //assert
                assert.equal(actual.length, 4);
                assert.equal(actual[0].player1.name, 'john');
                assert.equal(actual[0].player2.name, 'jane');
                assert.equal(actual[1].player1.name, 'bob');
                assert.equal(actual[1].player2.name, 'alice');
                assert.equal(actual[2].player1, null);
                assert.equal(actual[2].player2, null);
                assert.equal(actual[3].player2.name, 'anton');
                assert.equal(actual[3].player1, null);
            });

            it('should number each match to ease lookup', function () {
                //setup
                var engine = new SingleElim();
                var actual = null;
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });
                //action
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'anton'}
                ], callbackSpy);
                //assert
                assert.equal(actual.length, 4);
                assert.equal(actual[0].number, 1);
                assert.equal(actual[1].number, 2);
                assert.equal(actual[2].number, 3);
                assert.equal(actual[3].number, 4);
            });
        });
        describe('create subsequent matches', function () {
            it('should create the subsequent match for a 2-match bracket', function () {
                //setup
                var engine = new SingleElim();
                var actual = null;
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });
                //action
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'}
                ], callbackSpy);
                //assert
                assert.equal(actual.length, 3);
                assert.equal(actual[2].number, 3);
                assert.equal(actual[2].player1, null);
                assert.equal(actual[2].player2, null);
            });

            it('should be able to handle multiple levels of upcoming matches', function () {
                //setup
                var engine = new SingleElim();
                var actual = null;
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });
                //action
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'peter'},
                    {name: 'franz'},
                    {name: 'cole'},
                    {name: 'patrick'}
                ], callbackSpy);
                //assert
                assert.equal(actual.length, 7);
                assert.equal(actual[4].number, 5);
                assert.equal(actual[4].player1, null);
                assert.equal(actual[4].player2, null);
                assert.equal(actual[5].number, 6);
                assert.equal(actual[5].player1, null);
                assert.equal(actual[5].player2, null);
                assert.equal(actual[6].number, 7);
                assert.equal(actual[6].player1, null);
                assert.equal(actual[6].player2, null);
            });
        });

        describe('link matches', function () {
            it('should indicate next match number for each match', function () {
                //setup
                var engine = new SingleElim();
                var actual = null;
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });
                //action
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'peter'},
                    {name: 'franz'},
                    {name: 'cole'},
                    {name: 'patrick'}
                ], callbackSpy);
                //assert
                assert.equal(actual[0].next, 5);
                assert.equal(actual[1].next, 5);
                assert.equal(actual[2].next, 6);
                assert.equal(actual[3].next, 6);

                assert.equal(actual[4].next, 7);
                assert.equal(actual[5].next, 7);
                assert.equal(actual[6].next, null);
            });

            it('should handle odd brackets when numbering', function(){
                //setup
                var engine = new SingleElim();
                var actual = null;
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });
                //action
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'peter'}
                ], callbackSpy);
                //assert
                assert.equal(actual.length, 4)
                assert.equal(actual[0].next, 3);
                assert.equal(actual[1].next, 3);
                assert.equal(actual[2].next, 4);
                assert.equal(actual[3].next, null);
            });
        });

        describe('report win', function(){
            it('should update next match with match winner', function(){
                //setup
                var engine = new SingleElim();
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });

                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'peter'}
                ], callbackSpy);
                //action
                engine.reportWin(1, 2, 0, actual, callbackSpy);

                //assert
                assert.equal(actual[2].player1.name, 'john');
                assert.equal(actual[0].complete, true);
            });

            it('should update next match with winners from both related matches', function(){
                //setup
                var engine = new SingleElim();
                var callbackSpy = sinon.spy(function(err, data){
                    actual = data;
                });
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'peter'}
                ], callbackSpy);
                //action
                engine.reportWin(1, 2, 0, actual, callbackSpy);
                engine.reportWin(2, 0, 2, actual, callbackSpy);

                //assert
                assert.equal(actual[2].player1.name, 'john');
                assert.equal(actual[2].player2.name, 'alice');
                assert.equal(actual[0].complete, true);
            });

            it('should not allow reporting an already reported match', function(){
                //setup
                var engine = new SingleElim();
                var callbackSpy = sinon.spy(function(error, data){
                    actual = data;
                });
                engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'peter'}
                ], callbackSpy);
                engine.reportWin(1, 2, 0, actual, callbackSpy);
                //action
                actual = engine.reportWin(1, 0, 2, actual, callbackSpy);

                //assert
                assert.equal(callbackSpy.getCall(1).args[0], null);
                assert.equal(callbackSpy.getCall(1).args[1].length, 4);
                assert.equal(callbackSpy.getCall(2).args[0].message, 'alreadyReported');
            });
        });
    });
});

