var assert = require('chai').assert;
var sinon = require('sinon');
var TournamentService = require('../../../../lib/service/tournamentService').TournamentService;
describe('Tournament management', function () {
    var res = {};
    var tournamentService = {};
    var req = {body: {}};
    beforeEach(function () {
        tournamentService = new TournamentService();

        res = {
            json: function () {
            }
        };
        sinon.spy(res, 'json');
    });
    describe('Match reporting', function () {
        describe('getMatchesToReport', function () {

            it('should return an empty array if there s nothing to return and the call is ok', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        getMatchesToReport: function (bracket, callback) {
                            callback(false, []);
                        }
                    }
                };

                //action
                tournamentService.getMatchesToReport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
            });

            it('should return an error if engine call failed for some reason', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        getMatchesToReport: function (bracket, callback) {
                            callback(true, null);
                        }
                    }
                };
                //action
                tournamentService.getMatchesToReport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
            });

            it('should correctly handle an uncatched exception', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        getMatchesToReport: function (bracket, callback) {
                            throw new Error('this is an uncatched exception');
                        }
                    }
                };
                //action
                tournamentService.getMatchesToReport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
            });

            it('should return an empty list if no tournament engine is specified', function () {
                //setup
                //action
                tournamentService.getMatchesToReport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
            });

            it('should return an error if no engine is found', function () {
                //setup
                //action
                tournamentService.getMatchesToReport(null, res, {engine: 'some engine'})
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToReport');
            });
        });
        describe('reportMatch', function () {
            it('should give a detailed error when engine.reportWin fails', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        reportWin: function (number, s1, s2, bracket, callback) {
                            callback({message: 'this is an error message from the engine'});
                        }
                    }
                };
                //action
                tournamentService.reportMatch(req, res, {engine: ''}, null);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].error, 'errorReportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'this is an error message from the engine');
            });

            it('should report a detailed error when tournament update fails', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        reportWin: function (number, s1, s2, bracket, callback) {
                            callback(false);
                        }
                    }
                };
                var model = {update: function (criteria, data, callback) {
                    callback(true);
                }};
                //action
                tournamentService.reportMatch(req, res, {engine: ''}, model);
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1].error, 'errorReportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'Tournament update failed!');
            });
        });
    });
    describe('Match unreporting', function () {
        describe('getMatchesToUnreport', function () {
            it('should return an empty array if there s nothing to return and the call is ok', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        getUnreportableMatches: function (bracket, callback) {
                            callback(false, []);
                        }
                    }
                };
                //action
                tournamentService.getMatchesToUnreport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
            });

            it('should return an error if engine call failed for some reason', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        getUnreportableMatches: function (bracket, callback) {
                            callback(true, null);
                        }
                    }
                };
                //action
                tournamentService.getMatchesToUnreport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToUnreport');
            });

            it('should correctly handle an uncatched exception', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        getMatchesToUnreport: function (bracket, callback) {
                            throw new Error('this is an uncatched exception');
                        }
                    }
                };
                //action
                tournamentService.getMatchesToUnreport(null, res, {engine: 'dummy'});
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1], 'errorFindingMatchesToUnreport');
            });
            it('should return an empty list if no tournament engine is specified', function () {
                //setup
                //action
                tournamentService.getMatchesToUnreport(null, res, {});
                //assert
                assert.equal(res.json.getCall(0).args[0].length, 0);
            });
        });
        describe('unreportMatch', function () {
            it('should return a specific error if unreport fails', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        unreport: function (number, bracket, callback) {
                            callback({message: 'this is an error message from engine.unreport'})
                        }
                    }
                };
                //action
                tournamentService.unreportMatch(req, res, {bracket: {}}, null);
                //assert
                assert.equal(res.json.getCall(0).args[0], 409);
                assert.equal(res.json.getCall(0).args[1].error, 'errorUnreportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'this is an error message from engine.unreport');
            });

            it('should return a specific error if tournament unreport could not be saved', function () {
                //setup
                tournamentService.getTournamentEngine = function () {
                    return {
                        initBracket: function () {
                            return {}
                        },
                        unreport: function (number, bracket, callback) {
                            callback(false, {})
                        }
                    }
                };
                var model = {
                    update: function (criteria, data, callback) {
                        callback(true);
                    }
                };
                //action
                tournamentService.unreportMatch(req, res, {bracket: {}}, model);
                //assert
                assert.equal(res.json.getCall(0).args[0], 500);
                assert.equal(res.json.getCall(0).args[1].error, 'errorUnreportingMatch');
                assert.equal(res.json.getCall(0).args[1].message, 'Tournament update failed!');
            });
        });
    })
});/**
 * Created by octo-mba on 10/24/14.
 */
