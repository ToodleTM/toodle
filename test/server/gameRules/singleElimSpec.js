var assert = require('chai').assert;
var sinon = require('sinon');
var SingleElim = require('../../../lib/gameRules/singleElim').SingleElim;

describe('SingleElim engine', function () {

    describe('initBracket', function () {
        function initBracketTest(expectedBracketLength, playersArray) {
            playersArray = playersArray || null;
            expectedBracketLength = expectedBracketLength || 0;
//setup
            var engine = new SingleElim();
            //action
            var actual = engine.initBracket(playersArray);
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
                initBracketTest(2, [
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'}
                ]);
            });

            it('should be able to handle odd amounts of players', function () {
                var engine = new SingleElim();
                //action
                var actual = engine.initBracket([
                    {name: 'john'},
                    {name: 'jane'},
                    {name: 'bob'},
                    {name: 'alice'},
                    {name: 'anton'}
                ]);
                //assert
                assert.equal(actual.length, 3);
                assert.equal(actual[0].player1.name, 'john');
                assert.equal(actual[0].player2.name, 'jane');
                assert.equal(actual[1].player1.name, 'bob');
                assert.equal(actual[1].player2.name, 'alice');
                assert.equal(actual[2].player1.name, 'anton');
                assert.equal(actual[2].player2, null);
            });
        });
    });

});

