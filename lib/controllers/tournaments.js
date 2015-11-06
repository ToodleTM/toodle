'use strict';
var TournamentService = require('../service/tournamentService.js').TournamentService,
    serverUtils = new (require('../utils/serverUtils.js'))(),
    formidable = require('formidable'),
    fs = require('fs'),
    Converter = require('csvtojson').Converter;

function errorOrTournamentNotFound(err, data) {
    return err || data === null;
}

var CLIENT_ERROR = 400;
var NOT_FOUND = 404;

var tournamentControllerUtils = new (require('../utils/tournamentControllerUtils'))();
exports.tournament = function () {
    var mongoose = require('mongoose'),
        Tournament = mongoose.model('Tournament');
    return Tournament;
};

exports.serverUtils = function () {
    return serverUtils;
};

exports.tournamentUser = function () {
    var mongoose = require('mongoose');
    return mongoose.model('TournamentUsers');
};

function updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, tournamentServiceFunctionName, Tournament) {
    if (errorOrTournamentNotFound(err, tournamentData)) {
        return res.json(NOT_FOUND);
    } else if (tournamentData.followingTournament) {
        res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
    } else {
        return tournamentService[tournamentServiceFunctionName](req, res, tournamentData, Tournament);
    }
}

exports.create = function (req, res) {
    var newTournament = new (this.tournament())(req.body);
    var newTournamentUser = new (this.tournamentUser())();
    var tournamentService = new TournamentService();
    tournamentService.saveTournament(req, res, newTournament, newTournamentUser);
};

exports.update = function (req, res, next) {
    var tournamentService = new TournamentService();
    tournamentControllerUtils.updateTournament(req, res, serverUtils, this.tournament(), tournamentService, req.body, next);
};

exports.admin = function (req, res, next) {
    var adminPageId = req.params.id;
    if (serverUtils.isThisTournamentIdValid(adminPageId)) {
        var tournamentService = new TournamentService();
        tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, this.tournament(), this.tournamentUser(), adminPageId, next);
    } else {
        return res.sendStatus(NOT_FOUND);
    }
};

exports.play = function (req, res, next) {
    var playId = req.params.id;
    this.tournament().findOne({signupID: playId}, function (err, tournamentData) {
        if (err) {
            return next(err);
        } else if (tournamentData) {
            delete tournamentData._doc._id;
            delete tournamentData._doc.followingTournament;
            delete tournamentData._doc.parentTournament;
            return res.json(tournamentData._doc);
        } else {
            return res.send(NOT_FOUND);
        }
    });

};

exports.updatePlayers = function (req, res) {
    var tournamentService = new TournamentService();
    this.tournament().findOne({signupID: req.body.signupID}, function (err, tournamentData) {
        updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'registerPlayer');
    });
};

exports.start = function (req, res) {
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        this.tournament().findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'startTournament');
        });
    } else {
        return res.send(NOT_FOUND);
    }
};

exports.stop = function (req, res) {
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        this.tournament().findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'stopTournament');
        });
    } else {
        return res.send(NOT_FOUND);
    }
};

exports.addPlayer = function (req, res) {
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        this.tournament().findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'registerPlayer');
        });
    } else {
        return res.send(NOT_FOUND);
    }
};

exports.matchesToReport = function (req, res) {
    var tournamentService = new TournamentService();
    this.tournament().find({signupID: req.query.id}, function (err, data) {
        if (errorOrTournamentNotFound(err, data)) {
            return res.json(NOT_FOUND);
        } else {
            return tournamentService.getMatchesToReport(req, res, data[0]);
        }
    });
};

exports.matchesToUnreport = function (req, res) {
    var tournamentService = new TournamentService();
    this.tournament().find({signupID: req.query.id}, function (err, data) {
        if (errorOrTournamentNotFound(err, data)) {
            return res.json(NOT_FOUND);
        } else {
            return tournamentService.getMatchesToUnreport(req, res, data[0]);
        }
    });
};

exports.reportMatch = function (req, res) {
    var tournamentService = new TournamentService();
    tournamentControllerUtils.reportMatchHelper(req, res, serverUtils, this.tournament(), tournamentService);
};

exports.unreportMatch = function (req, res) {
    var tournamentService = new TournamentService();
    tournamentControllerUtils.unreportMatchHelper(req, res, serverUtils, this.tournament(), tournamentService);
};

exports.forfeitMatch = function (req, res) {
    var tournamentService = new TournamentService();
    tournamentControllerUtils.forfeitMatchHelper(req, res, serverUtils, this.tournament(), tournamentService);
};

//exports.lockTournament = function (req, res) {
//    var Tournament = this.tournament();
//    var tournamentService = new TournamentService();
//    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
//        Tournament.findById(req.query.tournamentId, function (err, tournamentData) {
//            if (errorOrTournamentNotFound(err, tournamentData)) {
//                return res.json(404);
//            } else {
//                return tournamentService.lockTournament(req, res, tournamentData, Tournament);
//            }
//        });
//    } else {
//        return res.send(404);
//    }
//};
//
//exports.unlockTournament = function (req, res) {
//    var Tournament = this.tournament();
//    var tournamentService = new TournamentService();
//    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
//        Tournament.findById(req.query.tournamentId, function (err, tournamentData) {
//            if (errorOrTournamentNotFound(err, tournamentData)) {
//                return res.json(404);
//            } else {
//                return tournamentService.unlockTournament(req, res, tournamentData, Tournament);
//            }
//        });
//    } else {
//        return res.send(404);
//    }
//};

exports.multipleRegistration = function (req, res) {
    var form = formidable.IncomingForm();
    var Tournament = this.tournament();
    if (this.serverUtils().isThisTournamentIdValid(req.query.tournamentId)) {
        Tournament.findById(req.query.tournamentId, function (err, tournament) {
            if (tournament.followingTournament) {
                res.status(CLIENT_ERROR).json({message: 'tournamentLocked'});
            } else {
                form.parse(req, function (err, fields, files) {

                    var csvFileName = files.file.path;
                    var fileStream = fs.createReadStream(csvFileName);
                    var csvConverter = new Converter({constructResult: true});

                    csvConverter.on('end_parsed', function (jsonObj) {
                        return serverUtils.handleMultipleSeeding(jsonObj, Tournament, req, res, new TournamentService());
                    });

                    fileStream.pipe(csvConverter);
                });
            }
        });
    } else {
        return res.send(NOT_FOUND);
    }
};

exports.exportTournamentWinners = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
        this.tournament().findById(req.query.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(NOT_FOUND);
            } else {
                tournamentService.exportTournamentWinners(req, res, tournamentData);
            }
        });
    } else {
        return res.send(NOT_FOUND);
    }
};

exports.removePlayer = function (req, res) {
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        this.tournament().findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'unregisterPlayer');
        });
    } else {
        return res.send(NOT_FOUND);
    }
};

exports.rearrangePlayers = function (req, res) {
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        this.tournament().findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'rearrangePlayers');
        });
    } else {
        return res.send(NOT_FOUND);
    }
};

exports.swapPlayers = function (req, res) {
    var Tournament = this.tournament();
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'swapPlayers', Tournament);
        });
    } else {
        return res.send(404);
    }
};

exports.genBracketForTournament = function (req, res) {
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        this.tournament().findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'genPreconfigurationBracket');
        });
    } else {
        return res.send(404);
    }
};

exports.updateBracketDataAndStart = function (req, res) {
    var Tournament = this.tournament();
    var tournamentService = new TournamentService();
    if (this.serverUtils().isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
            updateTournamentsOrRejectRequest(req, res, err, tournamentData,  tournamentService, 'updateBracketDataAndStart', Tournament);
        });
    } else {
        return res.send(NOT_FOUND);
    }
};
