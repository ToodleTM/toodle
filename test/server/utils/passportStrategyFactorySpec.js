'use strict';
var sinon = require('sinon');
var assert = require('chai').assert;
var strategyFactory = new (require('../../../lib/utils/passportStrategyFactory').PassportStrategyFactory)();

var originalConsoleError = console.error;
before(function () {
    console.error = function () {
    };
});
after(function () {
    console.error = originalConsoleError;
});
describe('PassportStrategyFactory', function () {
    beforeEach(function () {
        sinon.spy(strategyFactory, 'createTwitterStrategy');
        sinon.spy(strategyFactory, 'createGPlusStrategy');

    });
    afterEach(function () {
        strategyFactory.createTwitterStrategy.restore();
        strategyFactory.createGPlusStrategy.restore();
    });
    it('should return null if strategyName provided is unknown', function () {
        //setup
        //action
        var actual = strategyFactory.createStrategy(null, {});
        //assert
        assert.equal(actual, null);
    });

    describe('if strategyName provided is "twitter"', function () {
        it('should return a twitterStrategy if options are valid', function () {
            //setup
            //action
            var actual = strategyFactory.createStrategy('twitter', {
                consumerKey: 'options.consumerKey',
                consumerSecret: 'options.consumerSecret',
                callbackURL: 'options.callbackURL'
            });
            //assert
            assert.equal(strategyFactory.createTwitterStrategy.calledOnce, true);
            assert.deepEqual(strategyFactory.createTwitterStrategy.getCall(0).args[0], {
                consumerKey: 'options.consumerKey',
                consumerSecret: 'options.consumerSecret',
                callbackURL: 'options.callbackURL'
            });
            assert.ok(actual);
            assert.equal(actual._callbackURL, 'options.callbackURL');
            assert.equal(actual._key, 'oauth:twitter');
            assert.equal(actual._skipUserProfile, false);
            assert.equal(actual._oauth._consumerKey, 'options.consumerKey');
            assert.equal(actual._oauth._consumerSecret, 'options.consumerSecret');
        });

        function testStrategyFactoryConfigErrorsForTwitter(options) {
            //setup / action
            var actual = strategyFactory.createStrategy('twitter', options);

            //assert
            assert.equal(actual, null);
        }

        it('should return null if consumerKey is missing', function () {
            testStrategyFactoryConfigErrorsForTwitter({
                consumerSecret: 'options.consumerSecret',
                callbackURL: 'options.callbackURL'
            });
        });

        it('should return null if consumerSecret is missing', function () {
            testStrategyFactoryConfigErrorsForTwitter({
                consumerKey: 'options.consumerKey',
                callbackURL: 'options.callbackURL'
            });
        });

        it('should return null if callbackURL is missing', function () {
            testStrategyFactoryConfigErrorsForTwitter({
                consumerKey: 'options.consumerKey',
                consumerSecret: 'options.consumerSecret'
            });
        });
    });

    describe('if strategyName provided is "gplus"', function () {
        it('should call the gplus generation function and return null if options are missing the consumerKey property', function () {
            //setup
            //action
            var actual = strategyFactory.createStrategy('gplus', {
            });
            //assert
            assert.equal(strategyFactory.createGPlusStrategy.called, false);
            assert.equal(actual, null);
        });

        it('should call the gplus generation function and return null if options are missing the consumerSecret property', function () {
            //setup
            //action
            var actual = strategyFactory.createStrategy('gplus', {
                consumerKey:'key'
            });
            //assert
            assert.equal(strategyFactory.createGPlusStrategy.called, false);
            assert.equal(actual, null);
        });

        it('should call the gplus generation function and return null if options are missing the callbackURL property', function () {
            //setup
            //action
            var actual = strategyFactory.createStrategy('gplus', {
                consumerKey:'key',
                consumerSecret:'secret'
            });
            //assert
            assert.equal(strategyFactory.createGPlusStrategy.called, false);
            assert.equal(actual, null);
        });
        it('should return a gplus strategy if strategyName provided is "gplus" and options are valid', function(){
            //setup

            //action
            var actual = strategyFactory.createStrategy('gplus',{
                consumerKey:'gplusConfig.clientID',
                consumerSecret:'gplusConfig.apiKey',
                callbackURL:'http://127.0.0.1:9042/gplus_callback'
            });
            //assert
            assert.equal(strategyFactory.createGPlusStrategy.calledOnce, true);
            assert.deepEqual(actual.options, {
                'clientId': 'gplusConfig.clientID',
                'clientSecret': 'gplusConfig.apiKey',
                'redirectUri': 'http://127.0.0.1:9042/gplus_callback'
            });
            assert.equal(actual.name, 'google');
        });
    });
});
