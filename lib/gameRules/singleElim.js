'use strict';
var SingleElim = function () {
};

SingleElim.prototype.descripion = "Single elimination bracket";

SingleElim.prototype.initBracket = function (players) {
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
    return bracket;
};

module.exports.SingleElim = SingleElim;