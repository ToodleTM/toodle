'use strict';
var _ = require('lodash');
var ServerUtils = function () {
};

var CLIENT_ERROR = 400;
var NOT_FOUND = 404;

ServerUtils.prototype.isThisTournamentIdValid = function (tournamentId) {
    return tournamentId && tournamentId.length === 24 && tournamentId.match(/[a-f0-9]{24}/g) !== null;
};

ServerUtils.prototype.handleMultipleSeeding = function (parsedCSV, TournamentModel, req, res, tournamentService) {
    if (parsedCSV[0].name) {
        TournamentModel.findById(req.query.tournamentId, function (err, tournamentData) {
            if (err) {
                return res.json(NOT_FOUND, {message:'noSuchTournament'});
            } else {
                try {
                    var tournament = tournamentService.multipleSeed(req, res, tournamentData, parsedCSV);
                    tournamentData.save(function (err) {
                        if (err) {
                            return res.json(CLIENT_ERROR, err);
                        } else {
                            return res.json(tournament);
                        }
                    });
                } catch (exception) {
                    return res.json(CLIENT_ERROR, {message: 'notACSVFile'});
                }
            }
        });
    } else {
        res.json(CLIENT_ERROR, {message: 'noNameField'});
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