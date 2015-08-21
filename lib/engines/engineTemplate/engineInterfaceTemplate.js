'use strict';
var SampleInterface = function () {
};

SampleInterface.prototype.descripion = 'Sample engine interface';
SampleInterface.prototype.version = '1.0';

SampleInterface.prototype.initBracket = function(players, callback){

};
SampleInterface.prototype.reportWin = function(matchNumber, player1Score, player2Score, bracket, matchComplete, callback){};
SampleInterface.prototype.unreport = function(matchNumber, bracket, callback){};
SampleInterface.prototype.getMatchesToReport = function(bracket, callback){};
SampleInterface.prototype.getUnreportableMatches = function(bracket, callback){};

SampleInterface.prototype.winners = function(tournament, callback){};

module.exports.Engine = SampleInterface;