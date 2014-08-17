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
    callback(null, bracket);
};

SingleElim.prototype.reportWin = function (matchNumber, player1Scrore, player2Score, bracket, callback) {
    var initialMatch = null;
    bracket.forEach(function (match) {
            if (match.number == matchNumber) {
                if (match.complete) {
                    callback({message: 'alreadyReported'});
                } else {
                    var endOfTournament = false;
                    initialMatch = match;
                    if (initialMatch.next) {
                        bracket.forEach(function (match) {
                            if (initialMatch && match.number == initialMatch.next) {
                                if (match.player1) {
                                    match.player2 = player1Scrore > player2Score ? initialMatch.player1 : initialMatch.player2;

                                } else {
                                    match.player1 = player1Scrore > player2Score ? initialMatch.player1 : initialMatch.player2;
                                }
                                initialMatch.complete = true;
                            }
                        });
                    } else {
                        endOfTournament = true;
                    }
                    callback(null, bracket, endOfTournament);
                }
            }
        }
    )
    ;
};

module.exports.SingleElim = SingleElim;