'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TournamentSchema = new Schema({
    tournamentName: String,
    players: [{name:String, faction:String}],
    signupID: String,
    game:String,
    engine:String,
    description:String,
    roundFormat:Number,
    numberOfPlayers:Number,
    locked:Boolean,
    running:Boolean,
    bracket:Object,
    round:Number,
    startDate:String,
    userPrivileges:{ type:Number, default:3}
});

/**
 * Validations
 */
TournamentSchema.path('tournamentName').validate(function (name) {
  return name && name.length;
}, 'Tournament name must not be blank');

module.exports = mongoose.model('Tournament', TournamentSchema);
