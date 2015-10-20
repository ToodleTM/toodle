'use strict';
var TournamentControllerUtils = function () {
};

var NOT_FOUND = 404;
var CLIENT_ERROR = 400;

function errorOrTournamentNotFound(err, data) {
    return err || data === null;
}
TournamentControllerUtils.prototype.reportMatchHelper = function (req, res, serverUtils, TournamentModel, tournamentService) {
    if (req.body.tournamentId) {
        if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
            TournamentModel.findById(req.body.tournamentId, function (err, tournamentData) {
                if (errorOrTournamentNotFound(err, tournamentData)) {
                    return res.status(NOT_FOUND).json({message: 'notFound'});
                } else if (tournamentData.followingTournament) {
                    return res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
                } else {
                    return tournamentService.reportMatch(req, res, tournamentData, TournamentModel);
                }
            });
        } else {
            return res.status(NOT_FOUND).json({message: 'notFound'});
        }
    } else if (req.body.signupID) {
        TournamentModel.findOne({signupID: req.body.signupID}, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.status(NOT_FOUND).json({message: 'notFound'});
            } else if (tournamentData.followingTournament) {
                return res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
            } else {
                if (tournamentData.userPrivileges > 1) {
                    return tournamentService.reportMatch(req, res, tournamentData, TournamentModel);
                } else {
                    return res.json(CLIENT_ERROR, {message: 'insufficientPrivileges'});
                }
            }
        });
    } else {
        return res.status(NOT_FOUND).json({message: 'notFound'});
    }
};

TournamentControllerUtils.prototype.unreportMatchHelper = function (req, res, serverUtils, TournamentModel, tournamentService) {
    if (req.body.tournamentId) {
        if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
            TournamentModel.findById(req.body.tournamentId, function (err, tournamentData) {
                if (errorOrTournamentNotFound(err, tournamentData)) {
                    return res.json(NOT_FOUND);
                } else if (tournamentData.followingTournament) {
                    return res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
                } else {
                    return tournamentService.unreportMatch(req, res, tournamentData, TournamentModel);
                }
            });
        } else {
            return res.status(NOT_FOUND).json({message: 'notFound'});
        }
    } else if (req.body.signupID) {
        TournamentModel.findOne({signupID: req.body.signupID}, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(NOT_FOUND);
            } else if (tournamentData.followingTournament) {
                return res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
            } else {
                if (tournamentData.userPrivileges >= 3) {
                    return tournamentService.unreportMatch(req, res, tournamentData, TournamentModel);
                } else {
                    return res.json(CLIENT_ERROR, {message: 'insufficientPrivileges'});
                }
            }
        });
    } else {
        res.status(NOT_FOUND).json({message: 'notFound'});
    }
};

TournamentControllerUtils.prototype.forfeitMatchHelper = function (req, res, serverUtils, TournamentModel, tournamentService) {
    if (req.body.tournamentId) {
        if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
            TournamentModel.findById(req.body.tournamentId, function (err, tournamentData) {
                if (errorOrTournamentNotFound(err, tournamentData)) {
                    return res.status(NOT_FOUND).json({});
                } else if (tournamentData.followingTournament) {
                    return res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
                } else {
                    return tournamentService.forfeitMatch(req, res, tournamentData, TournamentModel);
                }
            });
        } else {
            return res.status(NOT_FOUND).json({message: 'notFound'});
        }
    } else {
        res.status(CLIENT_ERROR).json({message: 'insufficientPrivileges'});
    }
};

TournamentControllerUtils.prototype.updateTournament = function (req, res, serverUtils, TournamentModel, tournamentService, tournamentDataFromRequestBody, next) {
    if (serverUtils.isThisTournamentIdValid(tournamentDataFromRequestBody._id)) {
        TournamentModel.findById(tournamentDataFromRequestBody._id, function (err, tournamentData) {
            if (err) {
                return next(err);
            } else if (tournamentData.followingTournament) {
                res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
            } else {
                if (tournamentData.running && tournamentData.engine !== tournamentDataFromRequestBody.engine) {
                    res.json(CLIENT_ERROR, {message: 'cantUpdateEngineWhileRunning'});
                } else {
                    Object.keys(tournamentDataFromRequestBody).forEach(function (key) {
                        tournamentData[key] = tournamentDataFromRequestBody[key];
                    });
                    return tournamentService.updateTournament(req, res, tournamentData);
                }
            }
        });
    } else {
        return res.status(NOT_FOUND).json({message: 'notFound'});
    }
};

module.exports = TournamentControllerUtils;
