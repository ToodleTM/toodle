'use strict';
var myController = require('../../../lib/controllers/my.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('getTournaments', function(){
    it('should return an error if no type was specified', function(){
        //setup
        var sendSpy = sinon.spy();
        var req = {query:{}, session:{passport:{user:{socialId:''}}}};
        var res = {
            status: function(){
                var returnFunction = function(){};
                returnFunction.send = sendSpy;
                return returnFunction;
            }
        };
        sinon.spy(res, 'status');
        //action
        myController.getTournaments(req, res);
        //assert
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 401);
        assert.equal(sendSpy.calledOnce, true);
        assert.deepEqual(sendSpy.getCall(0).args[0], {error:'noTypeProvided', message:'no tournament type provided'});
    });

    it('should return an error if provided type is unknown', function(){
        //setup
        var sendSpy = sinon.spy();
        var req = {query:{type:'someUnknownType'}, session:{passport:{user:{socialId:''}}}};

        var res = {
            status: function(){
                var returnFunction = function(){};
                returnFunction.send = sendSpy;
                return returnFunction;
            }
        };
        sinon.spy(res, 'status');
        //action
        myController.getTournaments(req, res);
        //assert
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 400);
        assert.equal(sendSpy.calledOnce, true);
        assert.deepEqual(sendSpy.getCall(0).args[0], {error:'unknownType', message:'provided type is unknown'});
    });

    it('should return a status 200 if provided type is admin', function(){
        //setup
        var sendSpy = sinon.spy();
        var req = {query:{type:'admin'}, session:{passport:{user:{socialId:''}}}};
        var res = {
            status: function(){
                var returnFunction = function(){};
                returnFunction.send = sendSpy;
                return returnFunction;
            }
        };
        myController.getTournamentUser = function(){
            return {find:function(options, callback){
                callback(null, [{tournamentId:'123T', userId:'123U'}]);
            }};
        };
        sinon.spy(res, 'status');
        //action
        myController.getTournaments(req, res);
        //assert
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(sendSpy.calledOnce, true);
        assert.deepEqual(sendSpy.getCall(0).args[0], {admin:[{tournamentId:'123T', userId:'123U'}]});
    });

    it('should return a status 200 if provided type is created', function(){
        //setup
        var sendSpy = sinon.spy();
        var req = {query:{type:'created'}, session:{passport:{user:{socialId:''}}}};
        var res = {
            status: function(){
                var returnFunction = function(){};
                returnFunction.send = sendSpy;
                return returnFunction;
            }
        };
        myController.getTournamentUser = function(){
            return {find:function(options, callback){
                callback(null, [{tournamentId:'123T', userId:'123U'}]);
            }};
        };
        sinon.spy(res, 'status');
        //action
        myController.getTournaments(req, res);
        //assert
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 200);
        assert.equal(sendSpy.calledOnce, true);
        assert.deepEqual(sendSpy.getCall(0).args[0], {created:[{tournamentId:'123T', userId:'123U'}]});
    });

    it('should return an error if user has no session', function(){
        //setup
        var sendSpy = sinon.spy();
        var req = {query:{type:'admin'}, session:{passport:{}}};
        var res = {
            status: function(){
                var returnFunction = function(){};
                returnFunction.send = sendSpy;
                return returnFunction;
            }
        };
        sinon.spy(res, 'status');
        //action
        myController.getTournaments(req, res);
        //assert
        assert.equal(res.status.calledOnce, true);
        assert.equal(res.status.getCall(0).args[0], 401);
        assert.equal(sendSpy.calledOnce, true);
        assert.deepEqual(sendSpy.getCall(0).args[0],  {error:'noSession', message:'User has no session'});
    });
});