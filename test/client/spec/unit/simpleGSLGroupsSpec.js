'use strict';
var SimpleGSLGroups = require('../../../../app/scripts/utils/simpleGSLGroups.js').Renderer;
var assert = require('chai').assert;

describe('SimpleGSLGroups renderer', function () {
    var renderer = null;
    beforeEach(function () {
        renderer = new SimpleGSLGroups();
    });
    describe('noFollowingMatchComplete', function () {
        it('should return false if match to check has a following match that is complete behind it', function () {
            //setup
            var group = {matches: {1: {complete: true, round: 2}}};
            var match = {round: 1};
            //action
            var actual = renderer.noFollowingMatchComplete(group, match);
            //assert
            assert.equal(actual, false);
        });

        it('should return true if match to check has a following match that is complete behind it', function () {
            //setup
            var group = {matches: {1: {complete: true, round: 1}}};
            var match = {round: 2};
            //action
            var actual = renderer.noFollowingMatchComplete(group, match);
            //assert
            assert.equal(actual, true);
        });
    });

    describe('canMatchBeReported', function () {
        it('should return true if match is not complete, players are set and userPrivileges == 2', function () {
            //setup

            //action
            var actual = renderer.canMatchBeReported({complete: false, player1: {}, player2: {}}, 2);
            //assert
            assert.equal(actual, true);
        });

        it('should return false if player1 is not set', function () {
            //setup
            //action
            var actual = renderer.canMatchBeReported({complete: false, player2: {}}, 2);
            //assert
            assert.equal(actual, false);
        });

        it('should return false if player2 is not set', function () {
            //setup
            //action
            var actual = renderer.canMatchBeReported({complete: false, player1: {}}, 2);
            //assert
            assert.equal(actual, false);
        });

        it('should return false if userPrivileges < 2', function () {
            //setup
            //action
            var actual = renderer.canMatchBeReported({complete: false, player2: {}, player1: {}}, 1);
            //assert
            assert.equal(actual, false);
        });

        it('should return false if match is complete', function () {
            //setup
            //action
            var actual = renderer.canMatchBeReported({complete: true, player1: {}, player2: {}}, 2);
            //assert
            assert.equal(actual, false);
        });
    });

    describe('canMatchBeUnreported', function () {
        function testMatchCanBeReported(matchComplete, noFollowingMatchesReturnValue, userPrivileges, expectedResult) {
//setup
            var match = {complete: matchComplete};
            renderer.noFollowingMatchComplete = function () {
                return noFollowingMatchesReturnValue;
            };
            //action
            var actual = renderer.canMatchBeUnreported(match, null, userPrivileges);
            //assert
            assert.equal(actual, expectedResult);
        }

        it('should return true if match is complete and there are no following matches to this one that are complete and userPrivileges == 3', function () {
            testMatchCanBeReported(true, true, 3, true);
        });

        it('should return false if match is not complete and there are no following matches to this one that are complete and userPrivileges == 3', function () {
            testMatchCanBeReported(false, true, 3, false);
        });

        it('should return false if match is complete and there are following matches to this one that are complete and userPrivileges == 3', function () {
            testMatchCanBeReported(true, false, 3, false);
        });

        it('should return false if match is complete and there are no following matches to this one that are complete and userPrivileges != 3', function () {
            testMatchCanBeReported(true, true, 2, false);
        });
    });

    describe('updateGroupsForGSLGroups', function () {
        it('should keep the same groups array reference when updating it', function () {
            //setup
            var tournamentData = {bracket:{1:{matches:{}}}};
            var groupsArray = [];
            var controllerReferences = {groups:groupsArray, getPlayersOrderedByScore:function(){}};
            //action
            renderer.updateGroupsForGSLGroups(tournamentData, controllerReferences);
            //assert
            assert.equal(groupsArray, controllerReferences.groups);
        });
    });
});