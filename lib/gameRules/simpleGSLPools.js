'use strict';
var _ = require('lodash');
var SimpleGSLPools = function () {
};
var NUMBER_OF_MATCHES_IN_GROUP = 5;

SimpleGSLPools.prototype.descripion = 'Simple GSL pools';

SimpleGSLPools.prototype.initBracket = function (players, callback) {
    if (players.length !== 0 && players.length % 4 === 0) {
        var groupsToCreate = players.length / 4;
        var newGroups = {};

        for (var i = 0; i < groupsToCreate; i++) {
            var groupNumber =i + 1;
            newGroups[groupNumber] = {};
            var group = newGroups[groupNumber];
            group.players = [];
            for (var j = 0; j < 4; j++) {
                var playerToInsert = players.shift();
                playerToInsert.win = 0;
                playerToInsert.winCount = 0;
                playerToInsert.loss = 0;
                playerToInsert.lossCount = 0;
                group.players.push(playerToInsert);
            }
            var match1Id = i * NUMBER_OF_MATCHES_IN_GROUP + 1;
            var match2Id = match1Id + 1;
            group.matches = {};
            group.matches[match1Id] = {
                player1: group.players[0],
                player2: group.players[3],
                round: 1,
                number: match1Id,
                group: groupNumber
            };
            group.matches[match2Id] = {
                player1: group.players[1],
                player2: group.players[2],
                round: 1,
                number: match2Id,
                group: groupNumber
            };
        }
        callback(null, newGroups);
    } else {
        callback({message: 'notEnoughPlayers'});
    }
};

function computeGroupNumberFromMatchNumber(matchNumber) {
    var groupNumber = Math.floor(matchNumber / 5);
    if (matchNumber % NUMBER_OF_MATCHES_IN_GROUP !== 0) {
        groupNumber += 1;
    }
    return groupNumber;
}
SimpleGSLPools.prototype.getMatchByNumber = function (groups, matchNumber) {
    if (groups && !isNaN(matchNumber) && matchNumber > 0) {
        var groupNumber = computeGroupNumberFromMatchNumber(matchNumber);
        if (groups[groupNumber]) {
            return groups[groupNumber].matches[matchNumber];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

function getMatchWinner(score1, score2, match) {
    return score1 > score2 ? match.player1 : match.player2;
}
function getMatchLoser(score1, score2, match) {
    return score1 < score2 ? match.player1 : match.player2;
}
function bothScoresAreValid(score1, score2) {
    return !isNaN(score1) && !isNaN(score2);
}
function initWinnerMatchIfNeeded(bracket, groupNumber) {
    if (!bracket[groupNumber].matches[(groupNumber-1)*5+3]) {
        bracket[groupNumber].matches[(groupNumber-1)*5+3] = {number: (groupNumber-1)*5+3, round: 2, group: groupNumber};
    }
}
function initLoserMatchIfNeeded(bracket, groupNumber) {
    if (!bracket[groupNumber].matches[(groupNumber-1)*5+4]) {
        bracket[groupNumber].matches[(groupNumber-1)*5+4] = {number: (groupNumber-1)*5+4, round: 2, group: groupNumber};
    }
}
function initDeciderMatchIfNeeded(bracket, groupNumber) {
    if (!bracket[groupNumber].matches[(groupNumber-1)*5+5]) {
        bracket[groupNumber].matches[(groupNumber-1)*5+5] = {number: (groupNumber-1)*5+5, round: 3, group: groupNumber};
    }
}
function seedPlayersOfMatch1InRound2Matches(bracket, groupNumber, winner, loser) {
    bracket[groupNumber].matches[(groupNumber-1)*5+3].player1 = winner;
    bracket[groupNumber].matches[(groupNumber-1)*5+4].player1 = loser;
}
function seedPlayersOfMatch2InRound2Matches(bracket, groupNumber, winner, loser) {
    bracket[groupNumber].matches[(groupNumber-1)*5+3].player2 = winner;
    bracket[groupNumber].matches[(groupNumber-1)*5+4].player2 = loser;
}
function seedRound2WinnerMatchLoserIntoDeciderMatch(bracket, groupNumber, loser) {
    bracket[groupNumber].matches[(groupNumber-1)*5+5].player1 = loser;
}
function seedRound2LoserMatchWinnerIntoDeciderMatch(bracket, groupNumber, winner) {
    bracket[groupNumber].matches[(groupNumber-1)*5+5].player2 = winner;
}
function getGroupMatchNumber(match) {
    return match.number % NUMBER_OF_MATCHES_IN_GROUP;
}
function isFirstMatchOfRound1(match) {
    return match.round === 1 && getGroupMatchNumber(match) === 1;
}
function isSecondMatchOfRound1(match) {
    return match.round === 1 && getGroupMatchNumber(match) === 2;
}
function isWinnersMatchOfRound2(match) {
    return match.round === 2 && getGroupMatchNumber(match) === 3;
}
function isLosersMatchOfRound2(match) {
    return match.round === 2 && getGroupMatchNumber(match) === 4;
}
function tryingToReportRound2WhenRound1IsNotOver(matchNumberInGroup, bracket, groupNumber) {
    return (matchNumberInGroup === 3 || matchNumberInGroup === 4) && (!bracket[groupNumber].matches[(groupNumber-1)*5+1].complete || !bracket[groupNumber].matches[(groupNumber-1)*5+2].complete);
}

function getMatchesToReportForGroup(group, groupNumber){
    var round1ReportableMatches = _.filter(group.matches, function(match){
        return match.round === 1 && !match.complete;
    });
    var round2ReportableMatches = _.filter(group.matches, function(match){
        return match.round === 2 && !match.complete;
    });

    var reportableDeciderMatch = round2ReportableMatches.length === 0 && round1ReportableMatches.length === 0 ? [group.matches[(groupNumber-1)*5+5]]: [];
    if(round1ReportableMatches.length > 0){
        return round1ReportableMatches;
    } else if(round2ReportableMatches.length > 0){
        return round2ReportableMatches;
    }else {
        return reportableDeciderMatch;
    }
}
function updateMatch(match, score1, score2, complete) {
    match.player1Score = score1;
    match.player2Score = score2;
    match.complete = complete;
}
SimpleGSLPools.prototype.updatePlayersScores = function(winner, winnerScore, loser, loserScore) {
    winner.lossCount = isNaN(winner.lossCount)? loserScore: winner.lossCount+loserScore;
    winner.win = isNaN(winner.win)? 1: winner.win+1;
    winner.winCount = isNaN(winner.winCount)? winnerScore: winner.winCount+winnerScore;
    loser.loss = isNaN(loser.loss)? 1: loser.loss+1;
    loser.lossCount = isNaN(loser.lossCount)? winnerScore: loser.lossCount+winnerScore;
    loser.winCount = isNaN(loser.winCount)? loserScore: loser.winCount+loserScore;
};

SimpleGSLPools.prototype.reportWin = function (matchNumber, player1Score, player2Score, groups, callback) {
    var score1 = parseInt(player1Score);
    var score2 = parseInt(player2Score);
    var matchNumberInGroup = matchNumber % NUMBER_OF_MATCHES_IN_GROUP;

    if (bothScoresAreValid(score1, score2)) {
        if (score1 !== score2) {
            var match = this.getMatchByNumber(groups, matchNumber);
            var groupNumber = computeGroupNumberFromMatchNumber(matchNumber);

            if (match) {
                var notDeciderMatchesToReport = _.filter(getMatchesToReportForGroup(groups[match.group], match.group), function(match){
                   return match.round === 2 || match.round === 1;
                });
                if (tryingToReportRound2WhenRound1IsNotOver(matchNumberInGroup, groups, groupNumber) || match.round === 3 && notDeciderMatchesToReport.length > 0) {
                    callback({message: 'previousMatchesNotComplete'});
                } else if (!match.complete) {
                    updateMatch(match, score1, score2, true);
                    var winner = getMatchWinner(score1, score2, match);
                    var loser = getMatchLoser(score1, score2, match);
                    initWinnerMatchIfNeeded(groups, groupNumber);
                    initLoserMatchIfNeeded(groups, groupNumber);
                    initDeciderMatchIfNeeded(groups, groupNumber);
                    var winnerScore = score1 > score2 ? score1 : score2;
                    var loserScore = score1 < score2 ? score1 : score2;
                    if (isFirstMatchOfRound1(match)) {
                        seedPlayersOfMatch1InRound2Matches(groups, groupNumber, winner, loser);
                    } else if (isSecondMatchOfRound1(match)) {
                        seedPlayersOfMatch2InRound2Matches(groups, groupNumber, winner, loser);
                    } else if (isWinnersMatchOfRound2(match)) {
                        seedRound2WinnerMatchLoserIntoDeciderMatch(groups, groupNumber, loser);
                    } else if (isLosersMatchOfRound2(match)) {
                        seedRound2LoserMatchWinnerIntoDeciderMatch(groups, groupNumber, winner);
                    }
                    this.updatePlayersScores(winner, winnerScore, loser, loserScore);
                    callback(null, groups);
                } else {
                    callback({message: 'alreadyReported'});
                }
            } else {
                callback({message: 'notFound'});
            }
        } else {
            callback({message: 'winnerMustHaveHigherScore'});
        }
    } else {
        callback({message: 'invalidScores'});
    }
};
function tryingToUnreportARound1MatchButRound2HasCompletedMatches(completedRound2Matches, matchToUnreport) {
    return completedRound2Matches.length > 0 && matchToUnreport.round === 1;
}
function tryingToUnreportRound2ButDeciderIsOver(groups, matchToUnreport) {
    return groups[matchToUnreport.group].matches[5] && groups[matchToUnreport.group].matches[5].complete && matchToUnreport.round === 2;
}
SimpleGSLPools.prototype.unreport = function (matchNumber, groups, callback) {
    var matchToUnreport = this.getMatchByNumber(groups, matchNumber);
    if(matchToUnreport){
        var completedRound2Matches =_.filter(groups[matchToUnreport.group].matches, function(match){
           return match.round === 2 && match.complete;
        });
        if(tryingToUnreportARound1MatchButRound2HasCompletedMatches(completedRound2Matches, matchToUnreport) || tryingToUnreportRound2ButDeciderIsOver(groups, matchToUnreport)){
            callback({message:'mustUnreportFollowUpMatchesBeforeThisOne'});
        } else if(matchToUnreport.complete){
            var score1 = matchToUnreport.player1Score;
            var score2 = matchToUnreport.player2Score;
            var winner = score1 > score2 ? matchToUnreport.player1 : matchToUnreport.player2;
            var loser = score1 < score2 ? matchToUnreport.player1 : matchToUnreport.player2;

            var winCount = score1 > score2 ? score1 : score2;
            var lossCount = score1 < score2 ? score1 : score2;
            winner.win -= 1;
            winner.winCount -= winCount;
            winner.lossCount -= lossCount;
            loser.loss -= 1;
            loser.winCount -= lossCount;
            loser.lossCount -= winCount;
            if(isFirstMatchOfRound1(matchToUnreport)){
                groups[matchToUnreport.group].matches[3].player1 = null;
                groups[matchToUnreport.group].matches[4].player1 = null;
            } else if(isSecondMatchOfRound1(matchToUnreport)){
                groups[matchToUnreport.group].matches[3].player2 = null;
                groups[matchToUnreport.group].matches[4].player2 = null;
            } else if(isWinnersMatchOfRound2(matchToUnreport)){
                groups[matchToUnreport.group].matches[5].player1 = null;
            } else if(isLosersMatchOfRound2(matchToUnreport)){
                groups[matchToUnreport.group].matches[5].player2 = null;
            }
            matchToUnreport.player1 = null;
            matchToUnreport.player2 = null;
            delete matchToUnreport.player1Score;
            delete matchToUnreport.player2Score;
            matchToUnreport.complete = false;
            callback(null, groups);
        } else {
            callback({message:'cannotUnreportIncompleteMatch'});
        }
    } else {
        callback({message:'cannotUnreportUnknownMatch'});
    }
};

SimpleGSLPools.prototype.getMatchesToReport = function (groups, callback) {
    var matchesToReport = [];
    _.each(groups, function(group, key){
        matchesToReport = matchesToReport.concat(getMatchesToReportForGroup(group, key));
    });
    callback(null, matchesToReport);
};

function getUnreportableMatchesForGroup(group){
    var completedMatches = _.filter(group.matches, function(match){
        return match.complete;
    });

    var completeDeciderMatch = _.filter(completedMatches, function(match){return match.number % 5 === 0;});
    var completeRound2Matches = _.filter(completedMatches, function(match){return match.number % 5 === 3 || match.number %5 === 4;});
    var completeRound1Matches = _.filter(completedMatches, function(match){return match.number % 5 === 1 || match.number % 5 === 2;});
    if(completeDeciderMatch.length){
        return completeDeciderMatch;
    } else if(completeRound2Matches.length){
        return completeRound2Matches;
    } else if(completeRound1Matches.length){
        return completeRound1Matches;
    } else {
        return [];
    }

}

SimpleGSLPools.prototype.getUnreportableMatches = function (groups, callback) {
    var unreportableMatches = [];
    _.each(groups, function(group){
        unreportableMatches = unreportableMatches.concat(getUnreportableMatchesForGroup(group));
    });
    callback(null, unreportableMatches);
};
SimpleGSLPools.prototype.winners = function () {
};

module.exports.Engine = SimpleGSLPools;