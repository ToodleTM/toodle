'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var OauthServer = require('../../../lib/oauth/oauthServer');
var fs = require('fs');
var modelsPath = __dirname + '/../../../lib/models/oauth/';
fs.readdirSync(modelsPath).forEach(function (file) {
    if (/(.*)\.(js$)/.test(file)) {
        require(modelsPath + '/' + file);
    }
});

describe('OAuth server', function () {
    var oauthServer;
    beforeEach(function(){
       oauthServer = new OauthServer();
    });
    describe('grantTypeAllowed', function () {
        it('should call the callback function with an error if grantType is not "authorization_code"', function () {
            //setup
            var clientId, grantType, callbackSpy = sinon.spy();
            //action
            oauthServer.grantTypeAllowed(clientId, grantType, callbackSpy);
            //assert
            assert.equal(callbackSpy.calledOnce, true);
            assert.deepEqual(callbackSpy.getCall(0).args, [false, false]);
        });

        it('should call the callback function with no errors if the grantType is "authorizxation_code"', function(){
            //setup
            var clientId, grantType='authorization_code', callbackSpy = sinon.spy();
            //action
            oauthServer.grantTypeAllowed(clientId, grantType, callbackSpy);
            //assert
            assert.equal(callbackSpy.calledOnce, true);
            assert.deepEqual(callbackSpy.getCall(0).args, [false, true]);
        });
    });
});