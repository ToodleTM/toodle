'use strict';
var SimpleGSLPools = function () {
};

SimpleGSLPools.prototype.descripion = 'Simple GSL pools';

SimpleGSLPools.prototype.initBracket = function (players, callback) {
    if (players.length !== 0 && players.length % 4 === 0) {
        var groupsToCreate = players.length / 4;
        var newPools = {};

        for (var i = 0; i < groupsToCreate; i++) {
            var poolNumber = '' + (i + 1);
            newPools[poolNumber] = {};
            var pool = newPools[poolNumber];
            pool.players = [];
            for (var j = 0; j < 4; j++) {
                pool.players.push(players.shift());
            }
            var match1Id = i * 5 + 1;
            var match2Id = match1Id + 1;
            pool.matches = {};
            pool.matches[match1Id] = {
                player1: pool.players[0],
                player2: pool.players[3],
                round: 1,
                number: match1Id,
                group: poolNumber
            };
            pool.matches[match2Id] = {
                player1: pool.players[1],
                player2: pool.players[2],
                round: 1,
                number: match2Id,
                group: poolNumber
            };
        }
        callback(null, newPools);
    } else {
        callback({message: 'notEnoughPlayers'});
    }
};

SimpleGSLPools.prototype.getMatchByNumber = function (groups, matchNumber) {
    if (groups && !isNaN(matchNumber) && matchNumber > 0) {
        var groupNumber = Math.floor(matchNumber / 4);
        if (matchNumber % 4 !== 0) {
            groupNumber += 1;
        }

        if (groups[groupNumber]) {
            return groups[groupNumber].matches[matchNumber];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

SimpleGSLPools.prototype.reportWin = function (matchNumber, player1Score, player2Score, bracket, callback) {
    var score1 = parseInt(player1Score);
    var score2 = parseInt(player2Score);
    if (!isNaN(score1) && !isNaN(score2)) {
        if (score1 !== score2) {
            var match = this.getMatchByNumber(bracket, matchNumber);
            if (match) {
                if (!match.complete) {
                    match.player1Score = score1;
                    match.player2Score = score2;
                    match.complete = true;
                    callback(null, bracket);
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
SimpleGSLPools.prototype.unreport = function () {
};
SimpleGSLPools.prototype.getMatchesToReport = function () {
};
SimpleGSLPools.prototype.getUnreportableMatches = function () {
};

SimpleGSLPools.prototype.winners = function () {
};

module.exports.Engine = SimpleGSLPools;