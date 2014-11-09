'use strict';
var TournamentControllerUtils = function () {
};

function errorOrTournamentNotFound(err, data) {
    return err || data == null;
}
TournamentControllerUtils.prototype.reportMatchHelper = function (req, res, serverUtils, Tournament, tournamentService) {
    if (req.body.tournamentId) {
        if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
            Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
                if (errorOrTournamentNotFound(err, tournamentData)) {
                    return res.json(404);
                } else {
                    return tournamentService.reportMatch(req, res, tournamentData, Tournament);
                }
            });
        } else {
            return res.json(404);
        }
    } else if (req.body.signupID) {
        Tournament.find({signupID: req.body.signupID}, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                if (tournamentData[0].userPrivileges > 1) {
                    return tournamentService.reportMatch(req, res, tournamentData[0], Tournament);
                } else {
                    return res.json(409, {message:'insufficientPrivileges'});
                }
            }
        });
    } else {
        return res.json(404);
    }
};

TournamentControllerUtils.prototype.unreportMatchHelper = function (req, res, serverUtils, Tournament, tournamentService) {
    if (req.body.tournamentId) {
        if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
            Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
                if (errorOrTournamentNotFound(err, tournamentData)) {
                    return res.json(404);
                } else {
                    return tournamentService.unreportMatch(req, res, tournamentData, Tournament);
                }
            });
        } else {
            return res.json(404);
        }
    } else if (req.body.signupID) {
        Tournament.find({signupID: req.body.signupID}, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                if(tournamentData[0].userPrivileges >=3 ){
                    return tournamentService.unreportMatch(req, res, tournamentData[0], Tournament);
                } else {
                    return res.json(409, {message:'insufficientPrivileges'});
                }
            }
        });
    } else {
        res.json(404);
    }
};

module.exports = TournamentControllerUtils;
