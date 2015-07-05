'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var SingleElim = require('../../../../lib/engines/singleElim').Engine;


var engine, callbackSpy, actualBracket;
var john = {name: 'john'};
var jane = {name: 'jane'};
var bob = {name: 'bob'};
//var alice = {name: 'alice'};
//var peter = {name: 'peter'};
var franz = {name: 'franz'};
//var cole = {name: 'cole'};
var patrick = {name: 'patrick'};

beforeEach(function () {
    engine = new SingleElim();
    callbackSpy = sinon.spy(function (err, data) {
        actualBracket = data;
    });
});

describe('SingleElim - Bracket preconfiguration', function () {
    it('should set incomplete matches as complete if next matche\'s player slot is already occupied', function () {
        //setup
        var callbackSpy = sinon.spy();
        var bracket = {
            1: {next: 3, nextFirst: true, number: 1, player1: jane, player2: bob, round: 4},
            2: {next: 3, nextFirst: false, number: 2, player1: franz, player2: patrick, round: 4},
            3: {
                next: null, number: 3,
                player1: john,
                player2: null,
                round: 2
            }};
        var expectedBracket = {
            1: {next: 3, nextFirst: true, number: 1, player1: jane, player2: bob, round: 4, complete:true, defwin:true},
            2: {next: 3, nextFirst: false, number: 2, player1: franz, player2: patrick, round: 4},
            3: {
                next: null, number: 3,
                player1: john,
                player2: null,
                round: 2
            }
        };
        //action
        engine.updateBracketMatchesStatusesAndStandings(bracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[1], expectedBracket);
    });

    it('should always position the defwin flag on a match if the slot where the winner of the match would end up is already taken', function(){
        //setup
        var callbackSpy = sinon.spy();
        var bracket = {
            1: {next: 3, nextFirst: true, number: 1, player1: null, player2: null, round: 4},
            2: {next: 3, nextFirst: false, number: 2, player1: john, player2: bob, round: 4},
            3: {
                next: null, number: 3,
                player1: john,
                player2: null,
                round: 2
            }
        };
        var expectedBracket = {
            1: {
                next: 3,
                nextFirst: true,
                number: 1,
                player1: null,
                player2: null,
                round: 4,
                complete: true,
                defwin: true
            },
            2: {next: 3, nextFirst: false, number: 2, player1: john, player2: bob, round: 4},
            3: {
                next: null, number: 3,
                player1: john,
                player2: null,
                round: 2
            }
        };
        //action
        engine.updateBracketMatchesStatusesAndStandings(bracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[1], expectedBracket);
    });

    it('should move up single players in defwin matches if next match slot is empty', function () {
        //setup
        var callbackSpy = sinon.spy();
        var bracket = {
            1: {next: 3, nextFirst: true, number: 1, player1: franz, player2: null, round: 4},
            2: {next: 3, nextFirst: false, number: 2, player1: john, player2: bob, round: 4},
            3: {
                next: null, number: 3,
                player1: null,
                player2: null,
                round: 2
            }
        };
        var expectedBracket = {
            1: {
                next: 3,
                nextFirst: true,
                number: 1,
                player1: franz,
                player2: null,
                round: 4,
                complete: true,
                defwin:true
            },
            2: {next: 3, nextFirst: false, number: 2, player1: john, player2: bob, round: 4},
            3: {
                next: null, number: 3,
                player1: franz,
                player2: null,
                round: 2
            }
        };
        //action
        engine.updateBracketMatchesStatusesAndStandings(bracket, callbackSpy);
        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[1], expectedBracket);
    });
    //it('should set incomplete match 1 w/ only one player as a defwin if corresponding slot1 in upcoming match is full', function(){
    //    //setup
    //    var callbackSpy = sinon.spy();
    //    var bracket = {
    //        1: {next: 3, nextFirst: true, number: 1, player1: jane, player2: null, round: 4},
    //        2: {next: 3, nextFirst: false, number: 2, player1: franz, player2: patrick, round: 4},
    //        3: {
    //            next: null, number: 3,
    //            player1: john,
    //            player2: null,
    //            round: 2
    //        }
    //    };
    //    var expectedBracket = {
    //        1: {
    //            next: 3,
    //            nextFirst: true,
    //            number: 1,
    //            player1: jane,
    //            player2: null,
    //            round: 4,
    //            complete: true,
    //            defwin: true
    //        },
    //        2: {next: 3, nextFirst: false, number: 2, player1: franz, player2: patrick, round: 4},
    //        3: {
    //            next: null, number: 3,
    //            player1: john,
    //            player2: null,
    //            round: 2
    //        }
    //    };
    //    //action
    //    engine.updateBracketMatchesStatusesAndStandings(bracket, callbackSpy);
    //    //assert
    //    assert.equal(callbackSpy.calledOnce, true);
    //    assert.deepEqual(callbackSpy.getCall(0).args[1], expectedBracket);
    //});

    it('should defwin a player that is alone on its 1st round match and move it to the next round if slot is empty', function(){
        //setup
        var callbackSpy = sinon.spy();
        var bracket = {
            1: {next: 3, nextFirst: true, number: 1, player1: jane, player2: null, round: 4},
            2: {next: 3, nextFirst: false, number: 2, player1: franz, player2: patrick, round: 4},
            3: {
                next: null, number: 3,
                player1: null,
                player2: null,
                round: 2
            }
        };

        var expectedBracket = {
            1: {next: 3, nextFirst: true, number: 1, player1: jane, player2: null, round: 4, complete:true, defwin:true},
            2: {next: 3, nextFirst: false, number: 2, player1: franz, player2: patrick, round: 4},
            3: {
                next: null, number: 3,
                player1: jane,
                player2: null,
                round: 2
            }
        };
        //action
        engine.updateBracketMatchesStatusesAndStandings(bracket, callbackSpy);

        //assert
        assert.equal(callbackSpy.calledOnce, true);
        assert.deepEqual(callbackSpy.getCall(0).args[1], expectedBracket);
    });
});