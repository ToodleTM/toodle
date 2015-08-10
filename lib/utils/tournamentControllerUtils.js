'use strict';
var TournamentControllerUtils = function () {
};

var NOT_FOUND = 404;
var CLIENT_ERROR = 400;

function errorOrTournamentNotFound(err, data) {
    return err || data === null;
}
TournamentControllerUtils.prototype.reportMatchHelper = function (req, res, serverUtils, Tournament, tournamentService) {
    if (req.body.tournamentId) {
        if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
            Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
                if (errorOrTournamentNotFound(err, tournamentData)) {
                    return res.json(NOT_FOUND);
                } else {
                    return tournamentService.reportMatch(req, res, tournamentData, Tournament);
                }
            });
        } else {
            return res.json(NOT_FOUND);
        }
    } else if (req.body.signupID) {
        Tournament.find({signupID: req.body.signupID}, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(NOT_FOUND);
            } else {
                if (tournamentData[0].userPrivileges > 1) {
                    return tournamentService.reportMatch(req, res, tournamentData[0], Tournament);
                } else {
                    return res.json(CLIENT_ERROR, {message: 'insufficientPrivileges'});
                }
            }
        });
    } else {
        return res.json(NOT_FOUND);
    }
};

TournamentControllerUtils.prototype.unreportMatchHelper = function (req, res, serverUtils, Tournament, tournamentService) {
    if (req.body.tournamentId) {
        if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
            Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
                if (errorOrTournamentNotFound(err, tournamentData)) {
                    return res.json(NOT_FOUND);
                } else {
                    return tournamentService.unreportMatch(req, res, tournamentData, Tournament);
                }
            });
        } else {
            return res.json(NOT_FOUND);
        }
    } else if (req.body.signupID) {
        Tournament.find({signupID: req.body.signupID}, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(NOT_FOUND);
            } else {
                if (tournamentData[0].userPrivileges >= 3) {
                    return tournamentService.unreportMatch(req, res, tournamentData[0], Tournament);
                } else {
                    return res.json(CLIENT_ERROR, {message: 'insufficientPrivileges'});
                }
            }
        });
    } else {
        res.json(NOT_FOUND);
    }
};

TournamentControllerUtils.prototype.updateTournament = function (req, res, serverUtils, newTournamentData, tournamentService, TournamentModel, next) {
    if (serverUtils.isThisTournamentIdValid(newTournamentData._id)) {
        TournamentModel.findById(newTournamentData._id, function (err, tournamentData) {
            if (err) {
                return next(err);
            } else {
                if (tournamentData.running && tournamentData.engine !== newTournamentData.engine) {
                    res.json(CLIENT_ERROR, {message: 'cantUpdateEngineWhileRunning'});
                } else {
                    Object.keys(newTournamentData).forEach(function (key) {
                        tournamentData[key] = newTournamentData[key];
                    });
                    return tournamentService.updateTournament(req, res, tournamentData);
                }
            }
        });
    } else {
        return res.status(NOT_FOUND).json({message:'notFound'});
    }
};

module.exports = TournamentControllerUtils;
