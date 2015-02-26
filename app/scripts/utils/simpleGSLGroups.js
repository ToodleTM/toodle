'use strict';
var _ = require('../../../node_modules/lodash/index.js');
var SimpleGSLGroups = function(){

};

function noFollowingMatchComplete(group, matchToCheck){
    var laterCompleteMatches = _.find(group.matches, function(match){
        return match.complete && match.round > matchToCheck.round;
    });
    return !laterCompleteMatches;
}

function updateGroupsForGSLGroups(tournamentData, controllerReferences) {
    controllerReferences.groups.splice(0, controllerReferences.groups.length);
    _.forEach(tournamentData.bracket, function (group) {
        var matches = [];
        _.forEach(group.matches, function (match) {
            match.canBeReported = !match.complete && match.player1 && match.player2 && tournamentData.userPrivileges >= 2;
            match.canBeUnreported = match.complete && noFollowingMatchComplete(group, match) && tournamentData.userPrivileges === 3;
            match.name = match.number;
            matches.push(match);
        });
        group.players = controllerReferences.getPlayersOrderedByScore(group);
        group.matches = matches;
        controllerReferences.groups.push(group);
    });
}

SimpleGSLGroups.prototype.render = function(tournamentData, customRenderer, controllerReferences){
    updateGroupsForGSLGroups(tournamentData, controllerReferences);
};

module.exports.Renderer = SimpleGSLGroups;