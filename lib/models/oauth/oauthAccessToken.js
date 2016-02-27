'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OAuthAccessTokensSchema = new Schema({
    accessToken: {type: String},
    clientId: {type: String},
    userId: {type: String},
    expires: {type: Date}
});

module.exports = mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);