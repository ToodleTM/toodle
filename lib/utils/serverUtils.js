'use strict';
var ServerUtils = function(){};

ServerUtils.prototype.isThisTournamentIdValid = function(tournamentId){
    return tournamentId.length == 24 && tournamentId.match(/[a-f0-9]{24}/g) != null;
};

module.exports = ServerUtils;