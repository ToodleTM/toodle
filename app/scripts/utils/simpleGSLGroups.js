'use strict';
var _ = require('../../../node_modules/lodash/index.js');
var SimpleGSLGroups = function(){

};

SimpleGSLGroups.prototype.noFollowingMatchComplete = function(group, matchToCheck){
    if(group){
        var laterCompleteMatches = _.find(group.matches, function(match){
            return match.complete && match.round > matchToCheck.round;
        });
        return !laterCompleteMatches;
    } else {
        return true;
    }
};

SimpleGSLGroups.prototype.canMatchBeReported = function(match, userPrivileges) {
    var result = !match.complete && match.player1 && match.player2 && userPrivileges >= 2;
    if(result === undefined){
        return false;
    }
    return result;
};

SimpleGSLGroups.prototype.canMatchBeUnreported = function (match, group, userPrivileges) {
    return match.complete && this.noFollowingMatchComplete(group, match) && userPrivileges === 3;
};

SimpleGSLGroups.prototype.updateGroupsForGSLGroups = function(tournamentData, controllerReferences) {
    controllerReferences.groups.splice(0, controllerReferences.groups.length);
    var self = this;
    _.forEach(tournamentData.bracket, function (group) {
        var matches = [];
        _.forEach(group.matches, function (match) {
            match.canBeReported = self.canMatchBeReported(match, tournamentData.userPrivileges);
            match.canBeUnreported = self.canMatchBeUnreported(match, group, tournamentData.userPrivileges);
            match.name = match.number;
            matches.push(match);
        });
        group.players = controllerReferences.getPlayersOrderedByScore(group);
        group.matches = matches;
        controllerReferences.groups.push(group);
    });
};

SimpleGSLGroups.prototype.render = function(tournamentData, customRenderer, controllerReferences){
    this.updateGroupsForGSLGroups(tournamentData, controllerReferences);
};

module.exports.Renderer = SimpleGSLGroups;