var Utils = require('../../../../app/scripts/utils/utils.js').Utils;
var assert = require('chai').assert;

describe('Toggle value function', function () {
    it('Should treat null input as false, thus returning true', function () {
        //setup
        var utils = new Utils();
        //action
        var actual = utils.toggleState(null);
        //assert
        assert.equal(actual, true);
    });

    it('Should return false when input is true', function () {
        //setup
        var utils = new Utils();
        //action
        var actual = utils.toggleState(true);
        //assert
        assert.equal(actual, false);
    });
});