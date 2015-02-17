'use strict';
var _ = require('lodash');
var ServerUtils = function () {
};

ServerUtils.prototype.isThisTournamentIdValid = function (tournamentId) {
    return tournamentId.length === 24 && tournamentId.match(/[a-f0-9]{24}/g) !== null;
};

ServerUtils.prototype.handleMultipleSeeding = function (parsedCSV, TournamentModel, req, res, tournamentService) {
    if (parsedCSV[0].name) {
        TournamentModel.findById(req.query.tournamentId, function (err, tournamentData) {
            if (err) {
                return res.json(404, {message:'noSuchTournament'});
            } else {
                try {
                    var tournament = tournamentService.multipleSeed(req, res, tournamentData, parsedCSV);
                    tournamentData.save(function (err) {
                        if (err) {
                            return res.json(400, err);
                        } else {
                            return res.json(tournament);
                        }
                    });
                } catch (exception) {
                    return res.json(409, {message: 'notACSVFile'});
                }
            }
        });
    } else {
        res.json(409, {message: 'noNameField'});
    }
};

ServerUtils.prototype.createTournamentId = function(timeStamp, tournamentName){
    if(tournamentName){
        var cleanedUpTournamentName = tournamentName.replace(/[^a-zA-Z0-9]+/g, '');
        if(!cleanedUpTournamentName){
            return null;
        }
        return cleanedUpTournamentName+timeStamp;
    } else {
        return null;
    }
};

ServerUtils.prototype.winnersToCSV = function(winnersList){
    var winnersCSV = 'name,faction\n';
    _.forEach(winnersList, function(winner){
        var faction = winner.faction?winner.faction:'';
        winnersCSV += winner.name+','+faction+'\n';
    });
    return new Buffer(winnersCSV);
};

module.exports = ServerUtils;