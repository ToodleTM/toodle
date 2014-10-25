var assert = require('chai').assert;
var sinon = require('sinon');
var serverUtils = new (require('../../../lib/utils/serverUtils'))();

describe('Server Utils', function () {
    describe('Tournament Id validation', function () {
        it('should return true if id is 24 digits long', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('544c02ddc0482f0d4d5c77a1');
            //assert
            assert.equal(actual, true);
        });

        it('should return false if id is shorter than 24 digits', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('544c02ddc0482f0d4d5c7a1');
            //assert
            assert.equal(actual, false);
        });

        it('should not accept characters that do not represent hexadecimal digits', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('z44c02ddc0482f0d4d5c77a1');
            //assert
            assert.equal(actual, false);
        });

        it('śhould not accept uppercase characters', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('544c02DDC0482f0d4d5c77a1');
            //assert
            assert.equal(actual, false);
        });

        it('should not accept an id that is more than 24 digits long', function () {
            //setup / action
            var actual = serverUtils.isThisTournamentIdValid('123456789012345678901234567890');
            //assert
            assert.equal(actual, false);
        });
    });
});