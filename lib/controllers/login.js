'use strict';
var passport = require('passport');
var crypto = require('crypto');
var url = require('url');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var twitterConfig = require('../config/social/twitterConfig.js');
var gplusConfig = require('../config/social/gplusConfig.js');

var passportStrategyFactory = new (require('../utils/passportStrategyFactory').PassportStrategyFactory)();

passport.use(
    passportStrategyFactory.createStrategy('twitter', twitterConfig)
);
passport.use(
    passportStrategyFactory.createStrategy('gplus', gplusConfig)
);

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (id, done) {
    User.findOne({
        socialId: id.id
    }, function (err, user) {
        var userInfo = user? user : {socialId:id.id};
        User.update({socialId:id.id}, {$set :{socialId:id.id}}, {upsert : true}, function(err){
            done(err, userInfo);
        });
    });
});

function generateAuthEndpointAddressForGPlus(state, redirectUri, clientID){
    return 'https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.login&state=' + state + '&redirect_uri='+redirectUri+'&response_type=code&client_id='+clientID+'&access_type=offline';
}

exports.initLoginFlow = function(req, res, next) {
    req.session.returnUrl = req.query.returnUrl;
    if (req.query.type === 'twitter') {
        next();
    } else {
        var state = crypto.createHash('sha256').update('' + req.session.id).digest('hex');
        res.redirect(generateAuthEndpointAddressForGPlus(state, gplusConfig.callbackURL, gplusConfig.consumerKey));
    }
};

exports.gplusGetAuthzCode = function(req, res, next){
    if(req.query.error){
        res.redirect(req.session.returnUrl);
    } else{
        var parsedUrl = url.parse(req.url, true);
        req.params.code = parsedUrl.query.code;
        next();
    }
};

exports.logout = function(req, res){
    req.logout();
    res.redirect(req.query.returnUrl);
};

exports.success = function(req, res){
    res.redirect(req.session.returnUrl);
};

exports.fail = function(req, res){
    var redirectUri = url.parse(req.session.returnUrl);
    if(!redirectUri.query){
        redirectUri.query = {};
    }
    redirectUri.query['loginError'] = 'Failed to login';
    res.redirect(url.format(redirectUri));
};

exports.sessionData = function(req, res){
    if(req.session && req.session.passport && req.session.passport.user){
        res.json(req.session.passport.user);
    } else {
        res.json({});
    }
};