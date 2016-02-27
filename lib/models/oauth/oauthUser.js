'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OAuthUsersSchema = new Schema({
    username: {type: String},
    password: {type: String},
    firstname: {type: String},
    lastname: {type: String},
    email: {type: String, default: ''}
});

module.exports = mongoose.model('OAuthUsers', OAuthUsersSchema);