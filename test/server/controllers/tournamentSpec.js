'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var tournamentController = require('../../../lib/controllers/tournaments.js');

describe('Tournament Controller', function(){
    it('should not return admin properties when the /play endpoint is called', function(){
        //setup
        var req = {params:{}};
        var res = {
            json:sinon.spy()};
        var tournamentMock = {findOne:function(criteria, callback){
            callback(null, {_doc:{_id:'_id', followingTournament:'followup', parentTournament:'parent'}});
        }};
        sinon.stub(tournamentController, 'tournament').returns(tournamentMock);
        //action
        tournamentController.play(req, res, null);
        //assert
        assert.equal(res.json.calledOnce, true);
        assert.deepEqual(res.json.getCall(0).args, [{}]);
    });
});