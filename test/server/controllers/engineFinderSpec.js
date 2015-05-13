'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var engineFinder = require('../../../lib/controllers/engineFinder.js');
describe('Engine Finder', function(){
    it('should always return the "---" element as the 1st element of the results array', function(){
        //setup
        var req = {};
        var jsonSpy = sinon.spy();
        var res = {
            status:function(){
                var returnJson = function(){};
                returnJson.json = jsonSpy;
                return returnJson;
            }
        };
        sinon.spy(res, 'status');
        var original = engineFinder.listAvailableEngines;
        engineFinder.listAvailableEngines = function(callback){
            callback(null, []);
        };
        //action
        engineFinder.lookup(req, res);
        //assert
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(jsonSpy.calledOnce, true);
        assert.equal(jsonSpy.getCall(0).args[0].length, 1);
        assert.deepEqual(jsonSpy.getCall(0).args[0][0], {version:'0', description:' --- ', compatible:[], name:''});

        //destroy
        engineFinder.listAvailableEngines = original;
    });

    it('should append found engines to the list returned if engines are found', function(){
        //setup
        var req = {};
        var jsonSpy = sinon.spy();
        var res = {
            status:function(){
                var returnJson = function(){};
                returnJson.json = jsonSpy;
                return returnJson;
            }
        };
        sinon.spy(res, 'status');
        var original = engineFinder.listAvailableEngines;
        engineFinder.listAvailableEngines = function(callback){
            callback(null, [{version: '0', description: 'fizz', compatible: ['buzz'], name:'bazz'}]);
        };
        //action
        engineFinder.lookup(req, res);
        //assert
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(jsonSpy.calledOnce, true);
        assert.equal(jsonSpy.getCall(0).args[0].length, 2);
        assert.deepEqual(jsonSpy.getCall(0).args[0][0], {version:'0', description:' --- ', compatible:[], name:''});
        assert.deepEqual(jsonSpy.getCall(0).args[0][1], {version:'0', description:'fizz', compatible:['buzz'], name:'bazz'});

        //destroy
        engineFinder.listAvailableEngines = original;
    });


});