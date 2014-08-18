'use strict';
var SingleElim = function () {
};

SingleElim.prototype.descripion = "Single elimination bracket";

SingleElim.prototype.initBracket = function (players, callback) {
    var bracket = [];
    var matchNumber = 1;
    var singlePlayer = null;
    if (players && players.length) {
        if (players.length == 1) {
            bracket.push({player1: players[0]});
        } else {
            for (var i = 0; i < players.length - 1; i += 2) {
                bracket.push(
                    {
                        player1: players[i],
                        player2: players[i + 1],
                        number: matchNumber
                    }
                );
                matchNumber++;
            }
            if (players.length % 2) {
                singlePlayer = players[players.length - 1];
            }
        }
    }

    if (bracket.length > 1) {
        for (var i = 0; i < bracket.length - 1; i += 2) {
            bracket.push(
                {
                    player1: null,
                    player2: null,
                    number: matchNumber
                }
            );
            bracket[i].next = matchNumber;
            bracket[i + 1].next = matchNumber;
            matchNumber++;
        }
        if (singlePlayer) {
            bracket[bracket.length - 1].next = matchNumber;
            bracket.push(
                {
                    player1: null,
                    player2: singlePlayer,
                    number: matchNumber,
                    next: null
                }
            );
        }
    }
    var matches = {}
    bracket.forEach(function (match) {
        matches[match.number] = match;
    });
    callback(null, matches);
};

SingleElim.prototype.reportWin = function (matchNumber, player1Score, player2Score, bracket, callback) {
    var initialMatch = null;
    var match = bracket[matchNumber];
    if (match) {
        if (match.complete) {
            callback({message: 'alreadyReported'});
        } else {
            var endOfTournament = false;
            initialMatch = match;
            if (initialMatch.next) {
                var next = bracket[match.next];
                if (next) {
                    if (next.player1) {
                        next.player2 = player1Score > player2Score ? initialMatch.player1 : initialMatch.player2;

                    } else {
                        next.player1 = player1Score > player2Score ? initialMatch.player1 : initialMatch.player2;
                    }
                    initialMatch.complete = true;
                    initialMatch.score1 = player1Score;
                    initialMatch.score2 = player2Score;
                }
            } else {
                endOfTournament = true;
            }
            callback(null, bracket, endOfTournament);
        }
    }
};

SingleElim.prototype.unreport = function (matchNumber, bracket, callback) {
    var error = null;
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
                } else {
                    error = {message: 'nextMatchAlreadyReported'};
                }
            }
        } else {
            error = {message: 'cantUnreportIncompleteMatch'};
        }
    }

    callback(error, bracket);

};

module.exports.SingleElim = SingleElim;