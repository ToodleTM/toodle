var assert = require('chai').assert;
var sinon = require('sinon');
var serverUtils = new (require('../../../lib/utils/serverUtils'))();

describe('Server Utils', function () {
    describe('Tournament Id validation', function () {
        it('should return true if id is 24 digits long', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('544c02ddc0482f0d4d5c77a1');
            //assert
            assert.equal(actual, true);
        });

        it('should return false if id is shorter than 24 digits', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('544c02ddc0482f0d4d5c7a1');
            //assert
            assert.equal(actual, false);
        });

        it('should not accept characters that do not represent hexadecimal digits', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('z44c02ddc0482f0d4d5c77a1');
            //assert
            assert.equal(actual, false);
        });

        it('śhould not accept uppercase characters', function () {
            //setup
            //action
            var actual = serverUtils.isThisTournamentIdValid('544c02DDC0482f0d4d5c77a1');
            //assert
            assert.equal(actual, false);
        });

        it('should not accept an id that is more than 24 digits long', function () {
            //setup / action
            var actual = serverUtils.isThisTournamentIdValid('123456789012345678901234567890');
            //assert
            assert.equal(actual, false);
        });
    });
    describe('Multiseed handling', function () {
        it('should return an error if not all the parsed CSV items do not contain a "name" attribute', function () {
            //setup
            var res = {
                json: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            //parsedCSV, TournamentModel, req, res, tournamentService, next
            serverUtils.handleMultipleSeeding([{}], null, null, res, null, null);
            //assert
            assert.equal(res.json.getCall(0).args[0], 409);
            assert.equal(res.json.getCall(0).args[1].message, 'noNameField');
        });

        it('should call multipleSeed if parsed players have a name', function () {
            //setup
            var req = {query: {tournamentId: 1}}
            var res = {
                json: function () {
                }
            };
            var model = {
                findById: function (criteria, callback) {
                    callback(null, {});
                }
            };
            var tournamentService = {
                multipleSeed: function () {
                },
                updateTournament: function () {
                    return res.json({});
                }
            };
            sinon.spy(res, 'json');
            //action
            //parsedCSV, TournamentModel, req, res, tournamentService, next
            serverUtils.handleMultipleSeeding([{name: 'BillyBob'}], model, req, res, tournamentService, null);
            //assert
            assert.deepEqual(res.json.getCall(0).args[0], {});
        });

        it('should return a 404 error if no tournament was found', function () {
            //setup
            var req = {query: {tournamentId: 1}};
            var res = {
                json:function(){}
            };
            var model = {
                findById: function (criteria, callback) {
                    callback(true);
                }
            };
            sinon.spy(res, 'json');
            //action
            serverUtils.handleMultipleSeeding([{name: 'BillyBob'}], model, req, res, null);
            //assert
            assert.equal(res.json.getCall(0).args[0], 404);
            assert.equal(res.json.getCall(0).args[1].message, 'noSuchTournament');
        });

        it('should treat an exception from tournamentService.multipleSeed as the fact that the parsed file was not a CSV', function () {
            //this is probably not totally accurate but it seems pretty reasonable right now

            //setup
            var req = {query: {tournamentId: 1}}
            var res = {
                json: function () {
                }
            };
            var model = {
                findById: function (criteria, callback) {
                    callback(null, {});
                }
            };
            var tournamentService = {
                multipleSeed: function () {
                    throw new Error('some random error');
                },
                updateTournament: function () {
                    return res.json({});
                }
            };
            sinon.spy(res, 'json');
            //action
            serverUtils.handleMultipleSeeding([{name: 'BillyBob'}], model, req, res, tournamentService);
            //assert
            assert.equal(res.json.getCall(0).args[0], 409);
            assert.equal(res.json.getCall(0).args[1].message, 'notACSVFile');
        });
    });
});