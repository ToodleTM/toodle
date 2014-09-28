'use strict';
var _ = require('lodash');
var SingleElim = function () {
};

SingleElim.prototype.descripion = "Single elimination bracket";

SingleElim.prototype.defineBracketSize = function (numberPlayers) {
    var bracketSize = 1;
    if (numberPlayers == 1) {
        return 1;
    }
    while (numberPlayers > Math.pow(2, bracketSize)) {
        bracketSize++;
    }
    return Math.pow(2, bracketSize);
};

// @ 1st round, if a player is in a match w/out any opponent, he will be moved on to the next round when creating the bracket
function determineIfTheresAPlayerToMoveUpToNextRound(match) {
// we needn't check for both null players as the algorithm that feeds the base of the bracket forbids that by design
    var playerToMoveUp = null;
    if (match.player1 && !match.player2) {
        playerToMoveUp = match.player1;
    } else if (match.player2 && !match.player1) {
        playerToMoveUp = match.player2;
    }
    return playerToMoveUp;
}
function updateUpcomingMatchIfPlayerNeedsToMoveUp(playerToMoveUp, matches, i) {
    if (playerToMoveUp) {
        if (matches[i].nextFirst) {
            matches[matches[i].next].player1 = playerToMoveUp;
        } else {
            matches[matches[i].next].player2 = playerToMoveUp;
        }
        matches[i].complete = true;
    }
    return matches;
}
function updateFirstRoundMatchesWithDefWins(updatedPlayers, matches) {
    if (updatedPlayers) {
        var firstMatches = updatedPlayers.length / 2;
        for (var i = 1; i <= firstMatches; i++) {
            var playerToMoveUp = null;
            playerToMoveUp = determineIfTheresAPlayerToMoveUpToNextRound(matches[i]);
            matches = updateUpcomingMatchIfPlayerNeedsToMoveUp(playerToMoveUp, matches, i);
        }
    }
    return matches;
}

//this creates a list of players that has a size suitable for a binary bracket (power of 2 size)
// the idea is to create the smallest list possible that has a power of 2 size and can contain the actual list of players
// then insert "blank slots" at regular intervals to minimize the number of players skipping too much rounds in a single tournament
function createNormalizedPlayersList(bracketSize, currentInterval, players, baseInterval) {
    var updatedPlayers = [];
    var playersIndex = 0;
    for (var k = 0; k < bracketSize; k++) {
        if (Math.floor(currentInterval) - 1 == k) {
            updatedPlayers.push(players[playersIndex]);
            playersIndex++;
            currentInterval += baseInterval;
        } else {
            updatedPlayers.push(null);
        }
    }
    return updatedPlayers;
}
function createFirstRoundMatches(players, bracket, normalizedPlayersList, matchNumber) {
    if (players && players.length) {
        var bracketSize = this.defineBracketSize(players.length);
        var baseInterval = bracketSize / players.length;
        var currentInterval = baseInterval;
        if (players.length == 1) {
            bracket.push({player1: players[0], matchNumber: 1});
        } else {
            normalizedPlayersList = createNormalizedPlayersList(bracketSize, currentInterval, players, baseInterval);
            var round = normalizedPlayersList.length / 2;
            for (var i = 0; i < bracketSize - 1; i += 2) {
                bracket.push(
                    {
                        player1: normalizedPlayersList[i],
                        player2: normalizedPlayersList[i + 1],
                        number: matchNumber,
                        round:round
                    }
                );
                matchNumber++;
            }
        }
    }
    return {updatedPlayers: normalizedPlayersList, matchNumber: matchNumber};
}
//all the matches beyond the 1st round, numbered and linked to their parent matches
function createUpcomingMatches(bracket, matchNumber) {
    if (bracket.length > 1) {
        for (var i = 0; i < bracket.length - 1; i += 2) {
            bracket.push(
                {
                    player1: null,
                    player2: null,
                    number: matchNumber,
                    round:bracket[i].round/2
                }
            );
            bracket[i].next = matchNumber;
            bracket[i].nextFirst = true;
            bracket[i + 1].next = matchNumber;
            bracket[i + 1].nextSecond = true;
            matchNumber++;
        }
    }
    return matchNumber;
}
SingleElim.prototype.initBracket = function (players, callback) {
    var bracket = [];
    var matchNumber = 1;
    var updatedPlayers = null;
    var updatedPlayersAndMatchNumber = createFirstRoundMatches.call(this, players, bracket, updatedPlayers, matchNumber);
    updatedPlayers = updatedPlayersAndMatchNumber.updatedPlayers;
    matchNumber = updatedPlayersAndMatchNumber.matchNumber;
    createUpcomingMatches(bracket, matchNumber);
    var matches = _.indexBy(bracket, function(match){
        return match.number;
    });
    matches = updateFirstRoundMatchesWithDefWins(updatedPlayers, matches);
    callback(null, matches);
};

SingleElim.prototype.reportWin = function (matchNumber, player1Score, player2Score, bracket, callback) {
    var initialMatch = null;
    var match = bracket[matchNumber];
    if (match) {
        if (match.complete) {
            callback({message: 'alreadyReported'}, bracket, !match.next || false);
        } else {
            var endOfTournament = false;
            initialMatch = match;
            if (initialMatch.next) {
                var next = bracket[match.next];
                if (next) {
                    var playerToPromote = player1Score > player2Score ? initialMatch.player1 : initialMatch.player2;

                    if (initialMatch.nextFirst) {
                        next.player1 = playerToPromote;
                    } else {
                        next.player2 = playerToPromote;
                    }
                    initialMatch.complete = true;
                    initialMatch.score1 = player1Score;
                    initialMatch.score2 = player2Score;
                }
            } else {
                initialMatch.complete = true;
                initialMatch.score1 = player1Score;
                initialMatch.score2 = player2Score;
                endOfTournament = true;
            }
            callback(null, bracket, endOfTournament);
        }
    }
};

SingleElim.prototype.unreport = function (matchNumber, bracket, callback) {
    var currentMatch = bracket[matchNumber];
    if (currentMatch) {
        if (currentMatch.complete) {
            var nextMatch = bracket[currentMatch.next];
            if (nextMatch) {
                if (!nextMatch.complete) {
                    var winner = currentMatch.score1 > currentMatch.score2 ? currentMatch.player1.name : currentMatch.player2.name;
                    if (nextMatch.player1.name == winner) {
                        nextMatch.player1 = null;
                    } else {
                        nextMatch.player2 = null;
                    }
                    currentMatch.score1 = 0;
                    currentMatch.score2 = 0;
                    currentMatch.complete = false;
                    callback(null, bracket);
                } else {
                    callback({message: 'nextMatchAlreadyReported'}, bracket);
                }
            } else {
                currentMatch.score1 = 0;
                currentMatch.score2 = 0;
                currentMatch.complete = false;
                callback(null, bracket);
            }
        } else {
            callback({message: 'cantUnreportIncompleteMatch'}, bracket);
        }
    } else {
        callback({message:'cantUnreportUnknownMatch'}, bracket);
    }
};

SingleElim.prototype.getMatchesToReport = function(bracket, callback){
    var matchesToReport = _.filter(bracket, function(match){
        var previousMatches = _.filter(bracket, function(previousMatch){
            return previousMatch.next == match.number;
        });
        return !match.complete && _.every(previousMatches, function(item){return item.complete});
    });
    callback(null, matchesToReport);
};

SingleElim.prototype.getUnreportableMatches = function(bracket, callback){
    var matchesToUnreport = _.filter(bracket, function(match){
        return match.complete && (match.next == null || !bracket[match.next].complete)});
    callback(null, matchesToUnreport);
};

module.exports.Engine = SingleElim;