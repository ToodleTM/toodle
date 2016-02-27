'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OAuthAuthorizationCodesSchema = new Schema({
    authorizationCode: {type: String},
    clientId: {type: String},
    expires: {type: Date},
    user: {type: Object}
});

module.exports = mongoose.model('OAuthAuthorizationCodes', OAuthAuthorizationCodesSchema);