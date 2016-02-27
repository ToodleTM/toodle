'use strict';
var mongoose = require('mongoose');

var OAuthAccessTokensModel,
    OAuthClientsModel,
    OauthAuthorizationCodesModel;

var OAuthServer = function(){
    OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens');
    OAuthClientsModel = mongoose.model('OAuthClients');
    OauthAuthorizationCodesModel = mongoose.model('OAuthAuthorizationCodes');
};

OAuthServer.prototype.getAccessToken = function (bearerToken, callback) {
    OAuthAccessTokensModel.findOne({accessToken: bearerToken}, callback);
};

//used by the middlewares for the 1st & second steps of the oauth2-server module
// this function actually does 2 different things :
// * when used w/ the 1st endpoint, it allows the server to know if a client is legit
// * when used w/ the 2nd endpoint : we actually check that the clientId/clientSecret couple POST-ed by client app is correct
// Not my favorite to do things but right now I don't want to rewrite one of the middlewares ...
OAuthServer.prototype.getClient = function(clientId, clientSecret, callback){
    if (clientSecret === null) {
        return OAuthClientsModel.findOne({clientId: clientId}, callback);
    }
    OAuthClientsModel.findOne({clientId: clientId, clientSecret: clientSecret}, callback);
};

OAuthServer.prototype.grantTypeAllowed = function(clientId, grantType, callback){
    if(grantType === 'authorization_code'){
        callback(false, true);
    } else {
        callback(false, false);
    }
};

OAuthServer.prototype.getAuthCode = function (authCode, callback) {
    OauthAuthorizationCodesModel.findOne({authorizationCode: authCode}, function (err, data) {
        callback(null, data._doc);
    });
};
OAuthServer.prototype.saveAccessToken = function (token, clientId, expires, userId, callback) {
    var accessToken = new OAuthAccessTokensModel({
        accessToken: token,
        clientId: clientId,
        userId: userId.id,
        expires: expires
    });

    accessToken.save(callback);
};
OAuthServer.prototype.saveAuthCode = function (authCode, clientId, expires, user, callback) {
    var authorizationCode = new OauthAuthorizationCodesModel({
        authorizationCode: authCode,
        clientId: clientId,
        expires: expires,
        user: user
    });

    authorizationCode.save(callback);
};

module.exports = OAuthServer;