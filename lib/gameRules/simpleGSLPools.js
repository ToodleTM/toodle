'use strict';
var SimpleGSLPools = function () {
};

SimpleGSLPools.prototype.descripion = 'Simple GSL pools';

SimpleGSLPools.prototype.initBracket = function (players, callback) {
    if (players.length !== 0 && players.length % 4 === 0) {
        var groupsToCreate = players.length / 4;
        var newPools = {};

        for (var i = 1; i <= groupsToCreate; i++) {
            newPools['' + i] = {};
            var pool = newPools[i];
            pool.players = [];
            for (var j = 0; j < 4; j++) {
                pool.players.push(players.shift());
            }
            pool.matches = {
                '1': {player1: pool.players[0], player2: pool.players[3], round: 1, number: 1},
                '2': {player1: pool.players[1], player2: pool.players[2], round: 1, number: 2}
            };
        }
        callback(null, newPools);
    } else {
        callback({message: 'notEnoughPlayers'});
    }
};
SimpleGSLPools.prototype.reportWin = function () {
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