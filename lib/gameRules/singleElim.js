'use strict';
var SingleElim = function () {
};

SingleElim.prototype.descripion = "Single elimination bracket";

SingleElim.prototype.initBracket = function (players) {
    var bracket = [];

    if (players && players.length) {
        if (players.length == 1) {
            bracket.push({player1: players[0]});
        } else {
            for (var i = 0; i < players.length - 1; i += 2) {
                bracket.push(
                    {
                        player1: players[i],
                        player2: players[i + 1]
                    }
                );
            }
            if (players.length % 2) {
                bracket.push(
                    {
                        player1: players[players.length - 1],
                        player2: null
                    }
                );
            }
        }
    }
    return bracket;
};

module.exports.SingleElim = SingleElim;