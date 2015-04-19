'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TournamentUserSchema = new Schema({
    tournamentId:String,
    socialId:String,
    admin:Boolean,
    creator:Boolean,
    tournamentName:String
});

module.exports = mongoose.model('TournamentUsers', TournamentUserSchema);
