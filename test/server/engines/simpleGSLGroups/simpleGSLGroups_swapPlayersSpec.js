'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SimpleGSLGroups = require('../../../../lib/engines/simpleGSLGroups').Engine;
var engine, callbackSpy, actualBracket;
var john = {name: 'john'};
var jane = {name: 'jane'};
var bob = {name: 'bob'};
var alice = {name: 'alice'};
var lilah = {name: 'lilah'};
var yuri = {name: 'yuri'};
var giulietta = {name: 'giulietta'};
var manolo = {name: 'manolo'};

var callbackSpy = null;
beforeEach(function () {
    engine = new SimpleGSLGroups();
    callbackSpy = sinon.spy(function (err, data) {
        if (data) {
            actualBracket = JSON.parse(JSON.stringify(data));
        } else {
            actualBracket = null;
        }
    });
});

describe('SimpleGSLGroups - SwapPlayers', function () {
    it('should return an error if group1 id is not defined', function () {
        //setup
        var callbackSpy = sinon.spy();
        //action
        engine.swapPlayers(null, null, null, null, null, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerGroupNotFound'});
    });

    it('should return an error if group2 id is not defined', function () {
        //setup
        var callbackSpy = sinon.spy();
        //action
        engine.swapPlayers({}, null, null, null, null, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerGroupNotFound'});
    });

    it('should return an error if player1 slot is not defined', function () {
        //setup
        //action
        engine.swapPlayers(1, null, 1, 1, {}, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerPlayerNotFound'});
    });

    it('should return an error if player2 slot is not defined', function () {
        //setup
        //action
        engine.swapPlayers(1, 1, 1, null, {}, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerPlayerNotFound'});
    });

    it('should be able to swap two different players in the same match', function () {
        //setup
        engine.initBracket([john, jane, bob, alice], callbackSpy);
        //action
        engine.swapPlayers(1, 0, 1, 2, actualBracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledTwice, true);
        assert.equal(callbackSpy.getCall(1).args[0], null);
        assert.deepEqual(callbackSpy.getCall(1).args[1][1].players, [bob, jane, john, alice]);
    });

    it('should return an error if player1 id is negative', function () {
        //setup
        //action
        engine.swapPlayers(1, -1, 1, 2, actualBracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerPlayerNotFound'});
    });

    it('should return an error if player1 id superior to 3', function () {
        //setup
        //action
        engine.swapPlayers(1, 10, 1, 2, actualBracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerPlayerNotFound'});
    });

    it('should return an error if player2 id is negative', function () {
        //setup
        //action
        engine.swapPlayers(1, 1, 1, -2, actualBracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerPlayerNotFound'});
    });

    it('should return an error if player2 id superior to 3', function () {
        //setup
        //action
        engine.swapPlayers(1, 1, 1, 20, actualBracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[0], {message: 'cantSwapPlayerPlayerNotFound'});
    });

    it('should be able to swap players from different groups', function () {
        //setup
        engine.initBracket([john, jane, bob, alice, lilah, yuri, giulietta, manolo], callbackSpy);
        //action
        engine.swapPlayers(1, 0, 2, 2, actualBracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledTwice, true);
        assert.equal(callbackSpy.getCall(1).args[0], null);
        assert.deepEqual(callbackSpy.getCall(1).args[1][1].players, [giulietta, jane, bob, alice]);
        assert.deepEqual(callbackSpy.getCall(1).args[1][2].players, [lilah, yuri, john, manolo]);
    });

    describe('initPreconfigurationBracket', function(){
        it('should call initBracket and then callback', function () {
            //setup
            var players = [john, jane, bob, alice];
            sinon.spy(engine, 'initBracket');
            //action
            engine.initPreconfigurationBracket(players, callbackSpy);
            //assert
            assert.equal(engine.initBracket.calledOnce, true);
            assert.deepEqual(callbackSpy.calledOnce, true);
            engine.initBracket.restore();
        });

        it('should bubble up errors from the initBracket method', function () {
            //setup
            var players = [john, jane, bob, alice];
            engine.initBracket = function(players, callback){
                callback({message:'someError'});
            };
            //action
            engine.initPreconfigurationBracket(players, callbackSpy);
            //assert
            assert.deepEqual(callbackSpy.calledOnce, true);
            assert.deepEqual(callbackSpy.getCall(0).args[0], {message:'someError'});
        });
    });

    describe('updateBracketMatchesStatusesAndStandings', function(){
        it('should update the players order before calling initBracket', function(){
            //setup
            var newBracket = {1:{players:[john, alice, bob, jane]}, 2:{players:[giulietta, lilah, manolo, yuri]}};
            sinon.spy(engine, 'initBracket');
            //action
            engine.updateBracketMatchesStatusesAndStandings(newBracket, callbackSpy);
            //assert
            assert.equal(engine.initBracket.calledOnce, true);
            assert.deepEqual(engine.initBracket.getCall(0).args[0], [john, alice, bob, jane, giulietta, lilah, manolo, yuri]);
            engine.initBracket.restore();
        });
    });

});