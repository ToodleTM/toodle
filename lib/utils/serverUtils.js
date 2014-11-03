'use strict';
var ServerUtils = function () {
};

ServerUtils.prototype.isThisTournamentIdValid = function (tournamentId) {
    return tournamentId.length == 24 && tournamentId.match(/[a-f0-9]{24}/g) != null;
};

ServerUtils.prototype.handleMultipleSeeding = function (parsedCSV, TournamentModel, req, res, tournamentService) {
    if (parsedCSV[0].name) {
        TournamentModel.findById(req.query.tournamentId, function (err, tournamentData) {
            if (err) {
                return res.json(404, {message:'noSuchTournament'});
            } else {
                try {
                    tournamentService.multipleSeed(req, res, tournamentData, parsedCSV);
                    return tournamentService.updateTournament(req, res, tournamentData);
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
        var cleanedUpTournamentName = tournamentName.replace(/[^a-z0-9]+/g, '');
        if(!cleanedUpTournamentName){
            return null;
        }
        return cleanedUpTournamentName+timeStamp;
    } else {
        return null;
    }
};

module.exports = ServerUtils;