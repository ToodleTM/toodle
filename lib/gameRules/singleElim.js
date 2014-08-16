'use strict';
var SingleElim = function () {
};

SingleElim.prototype.descripion = "Single elimination bracket";

SingleElim.prototype.initBracket = function (players) {
    var bracket = [];
    var matchNumber = 1;
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
                bracket.push(
                    {
                        player1: players[players.length - 1],
                        player2: null,
                        number: matchNumber
                    }
                );
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
    }
    return bracket;
};

module.exports.SingleElim = SingleElim;