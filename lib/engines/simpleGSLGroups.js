'use strict';
var _ = require('lodash');
var async = require('async');
var SimpleGSLGroups = function () {
};
var NUMBER_OF_MATCHES_IN_GROUP = 5;

SimpleGSLGroups.prototype.meta = {
    version: '1.1',
    description: 'Simple GSL pools (SC2 GSL Format)',
    compatible: ['playerSwap'],
    name: 'simpleGSLGroups'
};

SimpleGSLGroups.prototype.initBracket = function (players, callback) {
    if (players.length !== 0 && players.length % 4 === 0) {
        var groupsToCreate = players.length / 4;
        var newGroups = {};

        for (var i = 0; i < groupsToCreate; i++) {
            var groupNumber = i + 1;
            newGroups[groupNumber] = {};
            var group = newGroups[groupNumber];
            group.players = [];
            for (var j = 0; j < 4; j++) {
                var playerToInsert = players[i * 4 + j];
                playerToInsert.win = 0;
                playerToInsert.winCount = 0;
                playerToInsert.loss = 0;
                playerToInsert.lossCount = 0;
                group.players.push(playerToInsert);
            }
            var match1Id = i * NUMBER_OF_MATCHES_IN_GROUP + 1;

            group.matches = {};
            group.matches[match1Id] = {
                player1: group.players[0],
                player2: group.players[3],
                round: 1,
                number: match1Id,
                group: groupNumber
            };
            group.matches[match1Id + 1] = {
                player1: group.players[1],
                player2: group.players[2],
                round: 1,
                number: match1Id + 1,
                group: groupNumber
            };
            group.matches[match1Id + 2] = {
                round: 2,
                number: match1Id + 2,
                group: groupNumber
            };
            group.matches[match1Id + 3] = {
                round: 2,
                number: match1Id + 3,
                group: groupNumber
            };
            group.matches[match1Id + 4] = {
                round: 3,
                number: match1Id + 4,
                group: groupNumber
            };
            group.number = groupNumber;
        }
        callback(null, newGroups);
    } else {
        callback({message: 'notEnoughPlayers'});
    }
};

function computeGroupNumberFromMatchNumber(matchNumber) {
    var groupNumber = Math.floor(matchNumber / NUMBER_OF_MATCHES_IN_GROUP);
    if (matchNumber % NUMBER_OF_MATCHES_IN_GROUP !== 0) {
        groupNumber += 1;
    }
    return groupNumber;
}
SimpleGSLGroups.prototype.getMatchByNumber = function (groups, matchNumber) {
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
    return !isNaN(score1) && !isNaN(score2) && score1 > -1 && score2 > -1;
}
function getFirstMatchNumber(groupNumber) {
    return (groupNumber - 1) * NUMBER_OF_MATCHES_IN_GROUP + 1;
}
function getSecondMatchNumber(groupNumber) {
    return (groupNumber - 1) * NUMBER_OF_MATCHES_IN_GROUP + 2;
}

function getWinnersMatchNumber(groupNumber) {
    return (groupNumber - 1) * NUMBER_OF_MATCHES_IN_GROUP + 3;
}
function getLosersMatchNumber(groupNumber) {
    return (groupNumber - 1) * NUMBER_OF_MATCHES_IN_GROUP + 4;
}
function getDeciderMatchNumber(groupNumber) {
    return groupNumber * NUMBER_OF_MATCHES_IN_GROUP;
}
function seedPlayersOfMatch1InRound2Matches(bracket, groupNumber, winner, loser) {
    bracket[groupNumber].matches[getWinnersMatchNumber(groupNumber)].player1 = winner;
    bracket[groupNumber].matches[getLosersMatchNumber(groupNumber)].player1 = loser;
}
function seedPlayersOfMatch2InRound2Matches(bracket, groupNumber, winner, loser) {
    bracket[groupNumber].matches[getWinnersMatchNumber(groupNumber)].player2 = winner;
    bracket[groupNumber].matches[getLosersMatchNumber(groupNumber)].player2 = loser;
}
function seedRound2WinnerMatchLoserIntoDeciderMatch(bracket, groupNumber, loser) {
    bracket[groupNumber].matches[getDeciderMatchNumber(groupNumber)].player1 = loser;
}
function seedRound2LoserMatchWinnerIntoDeciderMatch(bracket, groupNumber, winner) {
    bracket[groupNumber].matches[getDeciderMatchNumber(groupNumber)].player2 = winner;
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
    return (matchNumberInGroup === 3 || matchNumberInGroup === 4) && (!bracket[groupNumber].matches[getFirstMatchNumber(groupNumber)].complete || !bracket[groupNumber].matches[getSecondMatchNumber(groupNumber)].complete);
}

function getMatchesToReportForGroup(group) {
    var round1ReportableMatches = _.filter(group.matches, function (match) {
        return match.round === 1 && !match.complete;
    });
    var round2ReportableMatches = _.filter(group.matches, function (match) {
        return match.round === 2 && !match.complete;
    });

    var reportableDeciderMatch = round2ReportableMatches.length === 0 && round1ReportableMatches.length === 0 ? [group.matches[(group.number - 1) * 5 + 5]] : [];
    if (round1ReportableMatches.length > 0) {
        return round1ReportableMatches;
    } else if (round2ReportableMatches.length > 0) {
        return round2ReportableMatches;
    } else if (!reportableDeciderMatch[0].complete) {
        return reportableDeciderMatch;
    } else {
        return [];
    }
}
function updateMatch(match, score1, score2, complete) {
    match.score1 = score1;
    match.score2 = score2;
    match.complete = complete;
}

SimpleGSLGroups.prototype.updatePlayerInGroupList = function (group, playerToUpdate) {
    var playerToUpdateInListOfPlayers = _.find(group.players, function (player) {
        return player.name === playerToUpdate.name;
    });
    if (playerToUpdateInListOfPlayers) {
        playerToUpdateInListOfPlayers.winCount = playerToUpdate.winCount;
        playerToUpdateInListOfPlayers.win = playerToUpdate.win;
        playerToUpdateInListOfPlayers.lossCount = playerToUpdate.lossCount;
        playerToUpdateInListOfPlayers.loss = playerToUpdate.loss;
    }
};

SimpleGSLGroups.prototype.updatePlayersScores = function (winner, winnerScore, loser, loserScore) {
    winner.lossCount = isNaN(winner.lossCount) ? loserScore : winner.lossCount + loserScore;
    winner.win = isNaN(winner.win) ? 1 : winner.win + 1;
    winner.winCount = isNaN(winner.winCount) ? winnerScore : winner.winCount + winnerScore;
    loser.loss = isNaN(loser.loss) ? 1 : loser.loss + 1;
    loser.lossCount = isNaN(loser.lossCount) ? winnerScore : loser.lossCount + winnerScore;
    loser.winCount = isNaN(loser.winCount) ? loserScore : loser.winCount + loserScore;
};

SimpleGSLGroups.prototype.reportWin = function (matchNumber, score_1, score_2, groups, finalMatchReporting, callback) {
    var score1 = parseInt(score_1);
    var score2 = parseInt(score_2);
    var matchNumberInGroup = matchNumber % NUMBER_OF_MATCHES_IN_GROUP;

    if (bothScoresAreValid(score1, score2)) {
        if (!finalMatchReporting || score1 !== score2) {
            var match = this.getMatchByNumber(groups, matchNumber);
            if (match) {
                var groupNumber = match.group;
                var notDeciderMatchesToReport = _.filter(getMatchesToReportForGroup(groups[match.group]), function (match) {
                    return match.round === 2 || match.round === 1;
                });
                if (tryingToReportRound2WhenRound1IsNotOver(matchNumberInGroup, groups, groupNumber) || match.round === 3 && notDeciderMatchesToReport.length > 0) {
                    callback({message: 'previousMatchesNotComplete'});
                } else if (!match.complete) {
                    updateMatch(match, score1, score2, finalMatchReporting);
                    var winner = getMatchWinner(score1, score2, match);
                    var loser = getMatchLoser(score1, score2, match);
                    var winnerScore = score1 > score2 ? score1 : score2;
                    var loserScore = score1 < score2 ? score1 : score2;
                    if (finalMatchReporting) {
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
                    }
                    this.updatePlayerInGroupList(groups[match.group], winner);
                    this.updatePlayerInGroupList(groups[match.group], loser);
                    callback(null, groups);
                } else {
                    callback({message: 'alreadyReported'});
                }
            } else {
                callback({message: 'cantUnreportUnknownMatch'});
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
SimpleGSLGroups.prototype.unreport = function (matchNumber, groups, callback) {
    var matchToUnreport = this.getMatchByNumber(groups, matchNumber);
    if (matchToUnreport) {
        var completedRound2Matches = _.filter(groups[matchToUnreport.group].matches, function (match) {
            return match.round === 2 && match.complete;
        });
        if (tryingToUnreportARound1MatchButRound2HasCompletedMatches(completedRound2Matches, matchToUnreport) || tryingToUnreportRound2ButDeciderIsOver(groups, matchToUnreport)) {
            callback({message: 'mustUnreportFollowUpMatchesBeforeThisOne'});
        } else if (matchToUnreport.complete) {
            var score1 = matchToUnreport.score1;
            var score2 = matchToUnreport.score2;
            var winner = score1 > score2 ? matchToUnreport.player1 : matchToUnreport.player2;
            var loser = score1 < score2 ? matchToUnreport.player1 : matchToUnreport.player2;

            var winCountModifier = score1 > score2 ? score1 : score2;
            var lossCountModifier = score1 < score2 ? score1 : score2;
            winner.win -= 1;
            winner.winCount -= winCountModifier;
            winner.lossCount -= lossCountModifier;
            loser.loss -= 1;
            loser.winCount -= lossCountModifier;
            loser.lossCount -= winCountModifier;
            if (isFirstMatchOfRound1(matchToUnreport)) {
                groups[matchToUnreport.group].matches[getWinnersMatchNumber(matchToUnreport.group)].player1 = null;
                groups[matchToUnreport.group].matches[getLosersMatchNumber(matchToUnreport.group)].player1 = null;
            } else if (isSecondMatchOfRound1(matchToUnreport)) {
                groups[matchToUnreport.group].matches[getWinnersMatchNumber(matchToUnreport.group)].player2 = null;
                groups[matchToUnreport.group].matches[getLosersMatchNumber(matchToUnreport.group)].player2 = null;
            } else if (isWinnersMatchOfRound2(matchToUnreport)) {
                groups[matchToUnreport.group].matches[getDeciderMatchNumber(matchToUnreport.group)].player1 = null;
            } else if (isLosersMatchOfRound2(matchToUnreport)) {
                groups[matchToUnreport.group].matches[getDeciderMatchNumber(matchToUnreport.group)].player2 = null;
            }
            delete matchToUnreport.score1;
            delete matchToUnreport.score2;
            delete matchToUnreport.winner;
            delete matchToUnreport.forfeit;
            matchToUnreport.complete = false;
            this.updatePlayerInGroupList(groups[matchToUnreport.group], winner);
            this.updatePlayerInGroupList(groups[matchToUnreport.group], loser);
            callback(null, groups);
        } else {
            callback({message: 'cannotUnreportIncompleteMatch'});
        }
    } else {
        callback({message: 'cannotUnreportUnknownMatch'});
    }
};

SimpleGSLGroups.prototype.forfeit = function (matchNumber, forfeitSlot, score_1, score_2, groups, callback) {
    var score1 = parseInt(score_1);
    var score2 = parseInt(score_2);
    var currentMatch = this.getMatchByNumber(groups, matchNumber);
    if (currentMatch) {
        if (!currentMatch.complete) {
            if(forfeitSlot === 1 || forfeitSlot === 2){
                currentMatch.complete = true;
                currentMatch.forfeit = true;
                currentMatch.winner = forfeitSlot === 1? 2 : 1;
                currentMatch.score1 = score1;
                currentMatch.score2 = score2;
                var winnerScore = currentMatch['score'+currentMatch.winner],
                    loserScore = currentMatch['score' + forfeitSlot];
                var winner = currentMatch['player' + currentMatch.winner],
                    loser = currentMatch['player' + forfeitSlot], groupNumber = currentMatch.group;
                if (isFirstMatchOfRound1(currentMatch)) {
                    seedPlayersOfMatch1InRound2Matches(groups, groupNumber, winner, loser);
                } else if (isSecondMatchOfRound1(currentMatch)) {
                    seedPlayersOfMatch2InRound2Matches(groups, groupNumber, winner, loser);
                } else if (isWinnersMatchOfRound2(currentMatch)) {
                    seedRound2WinnerMatchLoserIntoDeciderMatch(groups, groupNumber, loser);
                } else if (isLosersMatchOfRound2(currentMatch)) {
                    seedRound2LoserMatchWinnerIntoDeciderMatch(groups, groupNumber, winner);
                }
                this.updatePlayersScores(winner, winnerScore, loser, loserScore);
                this.updatePlayerInGroupList(groups[currentMatch.group], winner);
                this.updatePlayerInGroupList(groups[currentMatch.group], loser);
                callback(null, groups);
            } else {
                callback({message: 'cantDefwinInvalidSlot'});
            }
        } else {
            callback({message: 'cantDefwinMatchIsComplete'});
        }
    } else {
        callback({message: 'cantDefwinMatchNotFound'});
    }
};

SimpleGSLGroups.prototype.getMatchesToReport = function (groups, callback) {
    var matchesToReport = [];
    _.each(groups, function (group, key) {
        matchesToReport = matchesToReport.concat(getMatchesToReportForGroup(group, key));
    });
    callback(null, matchesToReport);
};

function getUnreportableMatchesForGroup(group) {
    var completedMatches = _.filter(group.matches, function (match) {
        return match.complete;
    });

    var completeDeciderMatch = _.filter(completedMatches, function (match) {
        return getGroupMatchNumber(match) === 0;
    });
    if (completeDeciderMatch.length) {
        return completeDeciderMatch;
    }
    var completeRound2Matches = _.filter(completedMatches, function (match) {
        return getGroupMatchNumber(match) === 3 || getGroupMatchNumber(match) === 4;
    });
    if (completeRound2Matches.length) {
        return completeRound2Matches;
    }
    var completeRound1Matches = _.filter(completedMatches, function (match) {
        return getGroupMatchNumber(match) === 1 || getGroupMatchNumber(match) === 2;
    });
    if (completeRound1Matches.length) {
        return completeRound1Matches;
    } else {
        return [];
    }
}

SimpleGSLGroups.prototype.getUnreportableMatches = function (groups, callback) {
    var unreportableMatches = [];
    _.each(groups, function (group) {
        unreportableMatches = unreportableMatches.concat(getUnreportableMatchesForGroup(group));
    });
    callback(null, unreportableMatches);
};

SimpleGSLGroups.prototype.getPlayersOrderedByScore = function (group, callback) {
    if (group.players) {
        if (group.players.length > 4) {
            callback({message: 'tooManyPlayers'});
        } else if (group.players.length < 4) {
            callback({message: 'tooFewPlayers'});
        } else {
            var orderedList = _.sortBy(group.players, function(player){
                if (!player.win) {
                    player.win = 0;
                }
                if (!player.loss) {
                    player.loss = 0;
                }
                return player.loss - player.win;
            });
            callback(null, orderedList);
        }
    } else {
        callback({message: 'playersNotFound'});
    }
};

//wondering a bit whether this will actually be useful or not
SimpleGSLGroups.prototype.getWinnersFromGroup = function (group, self, callback) {
    var groupNumber = group.number;
    self.getPlayersOrderedByScore(group, function (err, orderedPlayers) {
        if (err) {
            callback(err);
        } else if (group.matches[getDeciderMatchNumber(groupNumber)].complete) {
            callback(null, orderedPlayers.splice(0, 2));
        } else {
            callback(null, []);
        }
    });
};

SimpleGSLGroups.prototype.winners = function (tournament, callback) {
    var groups = tournament.bracket;
    var groupsArray = _.map(groups, function (group) {
        return group;
    });
    var self = this;
    async.map(groupsArray,
        function (group, callback) {
            try {
                self.getWinnersFromGroup(group, self, function (err, groupWinners) {
                    callback(err, groupWinners);
                });
            } catch (error) {
                callback({message: 'errorWhileGettingWinners'});
            }
        }, function (err, groupWinners) {
            if (err) {
                callback({message: 'errorWhileGettingWinners'});
            } else {
                callback(null, _.flatten(groupWinners));
            }
        });

};

function groupsToSwapFromExist(group1, group2) {
    return group1 && group2;
}
function playersToSwapExist(playerToSwapInMatch1, playerToSwapInMatch2) {
    return playerToSwapInMatch1 !== null && playerToSwapInMatch2 !== null && playerToSwapInMatch1 >=0 && playerToSwapInMatch2 >= 0 && playerToSwapInMatch1 <4 && playerToSwapInMatch2 < 4;
}
SimpleGSLGroups.prototype.swapPlayers = function (group1, playerSlotToSwapInMatch1, group2, playerSlotToSwapInMatch2, bracket, callback) {
    if(groupsToSwapFromExist(group1, group2)){
        if(playersToSwapExist(playerSlotToSwapInMatch1, playerSlotToSwapInMatch2)){
            var firstPlayerToSwap = bracket[group1].players[playerSlotToSwapInMatch1];
            var secondPlayerToSwap = bracket[group2].players[playerSlotToSwapInMatch2];
            bracket[group1].players[playerSlotToSwapInMatch1] = secondPlayerToSwap;
            bracket[group2].players[playerSlotToSwapInMatch2] = firstPlayerToSwap;
            callback(null, bracket);
        } else {
            callback({message: 'cantSwapPlayerPlayerNotFound'});
        }
    } else {
        callback({message:'cantSwapPlayerGroupNotFound'});
    }
};
SimpleGSLGroups.prototype.updateBracketMatchesStatusesAndStandings = function (bracket, callback) {
    var newPlayerOrder = [];
    _.each(bracket, function(group){
       newPlayerOrder = newPlayerOrder.concat(group.players);
    });
    this.initBracket(newPlayerOrder, function(err, bracket){
        callback(null, bracket);
    });
};

SimpleGSLGroups.prototype.initPreconfigurationBracket = function (players, callback) {
    this.initBracket(players, function(err, data){
        callback(err, data);
    });
};

module.exports.Engine = SimpleGSLGroups;