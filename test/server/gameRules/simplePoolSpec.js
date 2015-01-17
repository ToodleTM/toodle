'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SimplePool = require('../../../lib/gameRules/simpleGSLPools').Engine;

describe('SimplePool engine', function () {
    var engine, callbackSpy, actualBracket;
    var john = {name: 'john'};
    var jane = {name: 'jane'};
    var bob = {name: 'bob'};
    var alice = {name: 'alice'};
    var peter = {name: 'peter'};
    var franz = {name: 'franz'};
    var cole = {name: 'cole'};
    var patrick = {name: 'patrick'};
    var lilah = {name: 'lilah'};
    var yuri = {name: 'yuri'};
    var giulietta = {name: 'giulietta'};
    var manolo = {name: 'manolo'};

    beforeEach(function () {
        engine = new SimplePool();
        callbackSpy = sinon.spy(function (err, data) {
            actualBracket = data;
        });
    });

    describe('initBracket', function(){
        it('should return an error if players list is empty', function(){
            //setup
            var callbackSpy = sinon.spy();
            //action
            engine.initBracket([], callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(0).args[0].message, 'notEnoughPlayers');
        });

        it('should return an error if players list is not a multiple of 4', function(){
            //setup
            var callbackSpy = sinon.spy();
            //action
            engine.initBracket([{name:'player1'}], callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(0).args[0].message, 'notEnoughPlayers');
        });

        it('should create a tournament w/ one pool and the list of 1st matches to play in it if the list of players contains 4 players', function(){
            //setup
            var callbackSpy = sinon.spy();
            //action
            engine.initBracket([{name:'player1'}, {name:'player2'}, {name:'player3'}, {name:'player4'}], callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(0).args[0], null);
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].players, [{name:'player1'}, {name:'player2'}, {name:'player3'}, {name:'player4'}]);
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[1], {player1:{name:'player1'}, player2:{name:'player4'}, number:1, round:1});
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].matches[2], {player1:{name:'player2'}, player2:{name:'player3'}, number:2, round:1});
        });

        it('should create as many groups as needed to fit all registered players into pools', function(){
            //setup
            var callbackSpy = sinon.spy();
            var players = [john, jane, bob, alice, cole, peter, franz, patrick, lilah, yuri, giulietta, manolo];

            //action
            engine.initBracket(players, callbackSpy);
            //assert
            assert.equal(callbackSpy.getCall(0).args[0], null);
            assert.equal(Object.keys(callbackSpy.getCall(0).args[1]).length, 3);
            assert.deepEqual(callbackSpy.getCall(0).args[1][1].players, [john, jane, bob, alice]);
            assert.deepEqual(callbackSpy.getCall(0).args[1][2].players, [cole, peter, franz, patrick]);
            assert.deepEqual(callbackSpy.getCall(0).args[1][3].players, [lilah, yuri, giulietta, manolo]);
        });
    });
});


