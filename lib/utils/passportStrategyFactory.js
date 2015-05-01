'use strict';
var TwitterStrategy = require('passport-twitter').Strategy;
var GooglePlusStrategy = require('passport-google-plus');

var PassportStrategyFactory = function () {
};


PassportStrategyFactory.prototype.createTwitterStrategy = function (options) {
    return new TwitterStrategy({
        consumerKey: options.consumerKey,
        consumerSecret: options.consumerSecret,
        callbackURL: options.callbackURL
    }, function (token, tokenSecret, profile, done) {
        var userProfile = {
            displayName: profile.displayName,
            pictureUrl: profile._json.profile_image_url,
            id: profile.id
        };
        done(null, userProfile);
    });
};

PassportStrategyFactory.prototype.createGPlusStrategy = function (options) {
    return new GooglePlusStrategy({
        clientId: options.consumerKey,
        clientSecret: options.consumerSecret,
        redirectUri: options.callbackURL
    }, function (tokens, profile, done) {
        var userProfile = {displayName: profile.displayName, pictureUrl: profile.image.url, id: profile.id};
        done(null, userProfile);
    });
};

PassportStrategyFactory.prototype.createStrategy = function (strategyName, options) {
    if (strategyName === 'twitter' && options.callbackURL) {
        try {
            return this.createTwitterStrategy(options);
        } catch (err) {
            console.error('Strategy configuration contains errors, could not create strategy (Twitter) '+ err);
            console.error('Key : '+options.consumerKey+ ', Secret : '+ options.consumerSecret+ ', Callback : '+options.callbackURL);
            return null;
        }
    } else if(strategyName === 'gplus'){
        if(!options.consumerKey || !options.consumerSecret || !options.callbackURL){
            console.error('Strategy configuration contains errors, could not create strategy (GPlus)');
            console.error('Key : '+options.consumerKey+ ', Secret : '+ options.consumerSecret+ ', Callback : '+options.callbackURL);
            return null;
        }
        return this.createGPlusStrategy(options);
    }
    return null;
};

module.exports.PassportStrategyFactory = PassportStrategyFactory;