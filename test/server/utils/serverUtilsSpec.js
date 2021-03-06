'use strict';
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
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var status = function () {
                    };
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
            //action
            //parsedCSV, TournamentModel, req, res, tournamentService, next
            serverUtils.handleMultipleSeeding([{}], null, null, res, null, null);
            //assert
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 400);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args, [{message:'noNameField'}]);
        });

        it('should call multipleSeed if parsed players have a name', function () {
            //setup
            var req = {query: {tournamentId: 1}};
            var res = {
                json: function () {
                }
            };
            var tournament = {
                save: function () {
                    res.json({});
                }
            };
            var model = {
                findById: function (criteria, callback) {
                    callback(null, tournament);
                }
            };
            var tournamentService = {
                multipleSeed: function () {
                }
            };
            sinon.spy(res, 'json');
            //action
            //parsedCSV, TournamentModel, req, res, tournamentService, next
            serverUtils.handleMultipleSeeding([{name: 'BillyBob'}], model, req, res, tournamentService, null);
            //assert
            assert.deepEqual(res.json.getCall(0).args[0], {});
            assert.equal(res.json.calledOnce, true);

        });

        it('should return a 404 error if no tournament was found', function () {
            //setup
            var req = {query: {tournamentId: 1}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var status = function () {
                    };
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
            var model = {
                findById: function (criteria, callback) {
                    callback(true);
                }
            };
            //action
            serverUtils.handleMultipleSeeding([{name: 'BillyBob'}], model, req, res, null);
            //assert
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 404);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args, [{message:'noSuchTournament'}]);
        });

        it('should treat an exception from tournamentService.multipleSeed as the fact that the parsed file was not a CSV', function () {
            //this is probably not totally accurate but it seems pretty reasonable right now

            //setup
            var req = {query: {tournamentId: 1}};
            var jsonSpy = sinon.spy();
            var res = {
                status: function () {
                    var status = function () {
                    };
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
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
            //action
            serverUtils.handleMultipleSeeding([{name: 'BillyBob'}], model, req, res, tournamentService);
            //assert
            assert.equal(res.status.calledOnce, true);
            assert.equal(res.status.getCall(0).args[0], 400);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args, [{message:'notACSVFile'}]);
        });

        it('should return an error if parsed CSV data is empty', function(){
            //setup
            var jsonSpy = sinon.spy();
            var res = {
                status:function(){
                    var status = function(){};
                    status.json = jsonSpy;
                    return status;
                }
            };
            sinon.spy(res, 'status');
            //action
            serverUtils.handleMultipleSeeding(null, null, null, res, null);
            //assert
            assert.equal(res.status.calledOnce, true);
            assert.deepEqual(res.status.getCall(0).args, [400]);
            assert.equal(jsonSpy.calledOnce, true);
            assert.deepEqual(jsonSpy.getCall(0).args, [{message:'noNameField'}]);
        });
    });

    describe('Create tournament id', function () {
        it('should return null for an empty tournament name', function () {
            //setup
            //action
            var actual = serverUtils.createTournamentId(null, '');
            //assert
            assert.equal(actual, null);
        });

        it('should return null for a null tournament name', function () {
            //setup

            //action
            var actual = serverUtils.createTournamentId(123, null);
            //assert
            assert.equal(actual, null);
        });

        it('should return null for an empty tournament name even if a timestamp is provided', function () {
            //setup
            //action
            var actual = serverUtils.createTournamentId(123, '');
            //assert
            assert.equal(actual, null);
        });


        it('should append a timestamp at the end of the ID', function () {
            //setup
            //action
            var actual = serverUtils.createTournamentId(123, 'name');
            //assert
            assert.equal(actual, 'name123');
        });

        it('should remove all non characters / non digits from the tournament name before appending it top the timestamp', function () {
            //setup

            //action
            var actual = serverUtils.createTournamentId(123, ' n. a\r,m<\t>\n/;:\\e"');
            //assert
            assert.equal(actual, 'name123');
        });
    });
    describe('winnersToCSV', function () {
        it('should return a buffer w/ only headers if winners list is emtpy', function () {
            //setup
            //action
            var actual = serverUtils.winnersToCSV([]);
            //assert
            assert.deepEqual(actual, new Buffer('name,faction\n'));
        });

        it('should return a buffer w/ the list of winners if there are players in the list', function(){
            //setup
            //action
            var actual = serverUtils.winnersToCSV([{name:'john', faction:'terran'}, {name:'lisa', faction:'random'}]);
            //assert
            assert.deepEqual(actual, new Buffer('name,faction\njohn,terran\nlisa,random\n'));
        });

        it('should not write anything in the faction column if the player does not have one', function(){
            //setup
            //action
            var actual = serverUtils.winnersToCSV([{name:'john'}, {name:'lisa', faction:'random'}]);
            //assert
            assert.deepEqual(actual, new Buffer('name,faction\njohn,\nlisa,random\n'));
        });
    });
});