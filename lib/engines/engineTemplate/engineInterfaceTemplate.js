'use strict';
var SampleInterface = function () {
};

SampleInterface.prototype.descripion = 'Sample engine interface';
SampleInterface.prototype.version = '1.0';

SampleInterface.prototype.initBracket = function (players, callback) {
};
SampleInterface.prototype.reportWin = function (matchNumber, player1Score, player2Score, bracket, matchComplete, callback) {
};
SampleInterface.prototype.unreport = function (matchNumber, bracket, callback) {
};
SampleInterface.prototype.forfeit = function (matchNumber, forfeitSlot, score1, score2, bracket, callback) {
};
SampleInterface.prototype.getMatchesToReport = function (bracket, callback) {
};
SampleInterface.prototype.getUnreportableMatches = function (bracket, callback) {
};
SampleInterface.prototype.winners = function (tournament, callback) {
};

//optional

// compatible : playerSwap
SampleInterface.prototype.swapPlayers = function (match1, playerToSwapInMatch1, match2, playerToSwapInMatch2, bracket, callback) {};

module.exports.Engine = SampleInterface;