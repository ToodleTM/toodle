'use strict';
var mongoose = require('mongoose'),
    Tournament = mongoose.model('Tournament'),
    TournamentUser = mongoose.model('TournamentUsers'),
    TournamentService = require('../service/tournamentService.js').TournamentService,
    serverUtils = new (require('../utils/serverUtils.js'))(),
    formidable = require('formidable'),
    fs = require('fs'),
    Converter = require('csvtojson').core.Converter;

function errorOrTournamentNotFound(err, data) {
    return err || data === null;
}

var tournamentControllerUtils = new (require('../utils/tournamentControllerUtils'))();

exports.create = function (req, res) {
    var newTournament = new Tournament(req.body);
    var newTournamentUser = new TournamentUser();
    var tournamentService = new TournamentService();
    tournamentService.saveTournament(req, res, newTournament, newTournamentUser);
};

exports.update = function (req, res, next) {
    var tournamentService = new TournamentService();
    tournamentControllerUtils.updateTournament(req, res, serverUtils, req.body, tournamentService, Tournament, next);
};

exports.admin = function (req, res, next) {
    var adminPageId = req.params.id;
    if (serverUtils.isThisTournamentIdValid(adminPageId)) {
        var tournamentService = new TournamentService();
        tournamentService.getTournamentDataAndSaveTournamentUserAssociation(req, res, Tournament, TournamentUser, adminPageId, next);
    } else {
        return res.sendStatus(404);
    }
};

exports.play = function (req, res, next) {
    var playId = req.params.id;
    Tournament.findOne({signupID: playId}, function (err, tournamentData) {
        if (err) {
            return next(err);
        } else if (tournamentData) {
            tournamentData._id = null;
            return res.send(tournamentData);
        } else {
            return res.send(404);
        }
    });

};

exports.updatePlayers = function (req, res) {
    var tournamentService = new TournamentService();
    Tournament.find({signupID: req.body.signupID}, function (err, data) {
        if (errorOrTournamentNotFound(err, data)) {
            return res.json(404);
        } else {
            return tournamentService.registerPlayer(req, res, data[0]);
        }
    });
};

exports.start = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, data) {
            if (errorOrTournamentNotFound(err, data)) {
                return res.json(404);
            } else {
                return tournamentService.startTournament(req, res, data);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.stop = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, data) {
            if (errorOrTournamentNotFound(err, data)) {
                return res.json(404);
            } else {
                return tournamentService.stopTournament(req, res, data);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.addPlayer = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, data) {
            if (errorOrTournamentNotFound(err, data)) {
                return res.json(404);
            } else {
                return tournamentService.registerPlayer(req, res, data, true);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.matchesToReport = function (req, res) {
    var tournamentService = new TournamentService();
    Tournament.find({signupID: req.query.id}, function (err, data) {
        if (errorOrTournamentNotFound(err, data)) {
            return res.json(404);
        } else {
            return tournamentService.getMatchesToReport(req, res, data[0]);
        }
    });
};

exports.matchesToUnreport = function (req, res) {
    var tournamentService = new TournamentService();
    Tournament.find({signupID: req.query.id}, function (err, data) {
        if (errorOrTournamentNotFound(err, data)) {
            return res.json(404);
        } else {
            return tournamentService.getMatchesToUnreport(req, res, data[0]);
        }
    });
};

exports.reportMatch = function (req, res) {
    var tournamentService = new TournamentService();
    tournamentControllerUtils.reportMatchHelper(req, res, serverUtils, Tournament, tournamentService);
};

exports.unreportMatch = function (req, res) {
    var tournamentService = new TournamentService();
    tournamentControllerUtils.unreportMatchHelper(req, res, serverUtils, Tournament, tournamentService);
};

exports.lockTournament = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
        Tournament.findById(req.query.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                return tournamentService.lockTournament(req, res, tournamentData, Tournament);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.unlockTournament = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
        Tournament.findById(req.query.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                return tournamentService.unlockTournament(req, res, tournamentData, Tournament);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.multipleRegistration = function (req, res) {
    var form = formidable.IncomingForm();
    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
        form.parse(req, function (err, fields, files) {

            var csvFileName = files.file.path;
            var fileStream = fs.createReadStream(csvFileName);
            var csvConverter = new Converter({constructResult: true});

            csvConverter.on('end_parsed', function (jsonObj) {
                return serverUtils.handleMultipleSeeding(jsonObj, Tournament, req, res, new TournamentService());
            });

            fileStream.pipe(csvConverter);
        });
    } else {
        return res.send(404);
    }
};

exports.exportTournamentWinners = function(req, res){
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
        Tournament.findById(req.query.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                tournamentService.exportTournamentWinners(req, res, tournamentData);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.removePlayer = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                return tournamentService.unregisterPlayer(req, res, tournamentData);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.rearrangePlayers = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                return tournamentService.rearrangePlayers(req, res, tournamentData);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.swapPlayers = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                tournamentService.swapPlayers(req, res, tournamentData, Tournament);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.genBracketForTournament = function(req, res){
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, data) {
            if (errorOrTournamentNotFound(err, data)) {
                return res.json(404);
            } else {
                return tournamentService.genPreconfigurationBracket(req, res, data);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.updateBracketDataAndStart = function(req, res){
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, data) {
            if (errorOrTournamentNotFound(err, data)) {
                return res.json(404);
            } else {
                return tournamentService.updateBracketDataAndStart(req, res, data, Tournament);
            }
        });
    } else {
        return res.send(404);
    }
};
