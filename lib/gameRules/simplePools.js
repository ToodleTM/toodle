'use strict';
var SimplePool = function () {
};

SimplePool.prototype.descripion = 'Sample interface';

SimplePool.prototype.initBracket = function(){};
SimplePool.prototype.reportWin = function(){};
SimplePool.prototype.unreport = function(){};
SimplePool.prototype.getMatchesToReport = function(){};
SimplePool.prototype.getUnreportableMatches = function(){};

SimplePool.prototype.winners = function(){};

module.exports.Engine = SimplePool;