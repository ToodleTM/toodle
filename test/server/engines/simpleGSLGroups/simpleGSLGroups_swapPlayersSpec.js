//'use strict';
//var assert = require('chai').assert;
//var sinon = require('sinon');
//var SimpleGSLGroups = require('../../../../lib/engines/simpleGSLGroups').Engine;
//
//var engine, callbackSpy, actualBracket;
//var john = {name: 'john'};
//var jane = {name: 'jane'};
//var bob = {name: 'bob'};
//var alice = {name: 'alice'};
//var peter = {name: 'peter'};
//var franz = {name: 'franz'};
//var cole = {name: 'cole'};
//var patrick = {name: 'patrick'};
//var lilah = {name: 'lilah'};
//var yuri = {name: 'yuri'};
//var giulietta = {name: 'giulietta'};
//var manolo = {name: 'manolo'};
//
//var groups = {};
//
//beforeEach(function () {
//    engine = new SimpleGSLGroups();
//    groups = {};
//    callbackSpy = sinon.spy(function (err, data) {
//        actualBracket = data;
//    });
//
//    john = {name: 'john'};
//    jane = {name: 'jane'};
//    bob = {name: 'bob'};
//    alice = {name: 'alice'};
//    peter = {name: 'peter'};
//    franz = {name: 'franz'};
//    cole = {name: 'cole'};
//    patrick = {name: 'patrick'};
//    lilah = {name: 'lilah'};
//    yuri = {name: 'yuri'};
//    giulietta = {name: 'giulietta'};
//    manolo = {name: 'manolo'};
//});
//describe('SimpleGSLGroups - swapPlayers', function () {
    //it('should refuse to swap players if 1st position to swap from does not exist', function () {
    //    //setup
    //    var callbackSpy = sinon.spy();
    //    //actiom
    //    engine.swapPlayers(match1, playerToSwapInMatch1, match2, playerToSwapInMatch2, bracket, callbackSpy);
    //    //assert
    //    assert.equal(callbackSpy.calledOnce, true);
    //    assert.deepEqual(callbackSpy.getCall(0).args[0], {message:'cantSwapPlayerMatchNotFound'});
    //});
//});