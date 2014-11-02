'use strict';
var mongoose = require('mongoose'),
    Tournament = mongoose.model('Tournament'),
    passport = require('passport'),
    TournamentService = require('../service/tournamentService.js').TournamentService,
    serverUtils = new (require('../utils/serverUtils.js'))(),
    formidable = require('formidable'),
    fs = require('fs'),
    Converter = require("csvtojson").core.Converter;

exports.create = function (req, res) {
    var newTournament = new Tournament(req.body);
    var tournamentService = new TournamentService();
    tournamentService.saveTournament(req, res, newTournament);
};

exports.update = function (req, res, next) {
    var tournament = req.body;
    var tournamentService = new TournamentService();
    var model = req.body;
    if (serverUtils.isThisTournamentIdValid(model._id)) {
        Tournament.findById(model._id, function (err, tournamentData) {
            if (err) {
                return next(err);
            } else {
                Object.keys(tournament).forEach(function (key) {
                    tournamentData[key] = tournament[key];
                });
                return tournamentService.updateTournament(req, res, tournamentData);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.admin = function (req, res, next) {
    var adminPageId = req.params.id;
    if (serverUtils.isThisTournamentIdValid(adminPageId)) {
        Tournament.findById(adminPageId, function (err, tournamentData) {
            if (err) {
                return next(err);
            } else if (tournamentData) {
                return res.send(tournamentData);
            } else {
                return res.send(404);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.play = function (req, res, next) {
    var playId = req.params.id;
    Tournament.find({signupID: playId}, function (err, tournamentData) {
        if (err) {
            return next(err);
        } else if (tournamentData) {
            tournamentData[0]._id = null;
            return res.send(tournamentData[0]);
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

function errorOrTournamentNotFound(err, data) {
    return err || data == null;
}
exports.matchesToReport = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
        Tournament.findById(req.query.tournamentId, function (err, data) {
            if (errorOrTournamentNotFound(err, data)) {
                return res.json(404);
            } else {
                return tournamentService.getMatchesToReport(req, res, data);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.matchesToUnreport = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.query.tournamentId)) {
        Tournament.findById(req.query.tournamentId, function (err, data) {
            if (errorOrTournamentNotFound(err, data)) {
                return res.json(404);
            } else {
                return tournamentService.getMatchesToUnreport(req, res, data);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.reportMatch = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                return tournamentService.reportMatch(req, res, tournamentData, Tournament);
            }
        });
    } else {
        return res.send(404);
    }
};

exports.unreportMatch = function (req, res) {
    var tournamentService = new TournamentService();
    if (serverUtils.isThisTournamentIdValid(req.body.tournamentId)) {
        Tournament.findById(req.body.tournamentId, function (err, tournamentData) {
            if (errorOrTournamentNotFound(err, tournamentData)) {
                return res.json(404);
            } else {
                return tournamentService.unreportMatch(req, res, tournamentData, Tournament);
            }
        });
    } else {
        return res.send(404);
    }
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

            csvConverter.on("end_parsed", function (jsonObj) {
                serverUtils.handleMultipleSeeding(jsonObj, Tournament, req, res, new TournamentService());
            });

            fileStream.pipe(csvConverter);
        });
    } else {
        return res.send(404);
    }
};

exports.removePlayer = function(req, res){
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

exports.rearrangePlayers = function(req, res){
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
