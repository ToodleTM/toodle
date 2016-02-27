'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OAuthRefreshTokensSchema = new Schema({
    refreshToken: {type: String},
    clientId: {type: String},
    userId: {type: String},
    expires: {type: Date}
});

module.exports = mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema);