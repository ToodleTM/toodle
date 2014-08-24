var R2B = require('../../../../app/scripts/utils/raphaelToBracket.js').RaphaelToBracket;
var assert = require('chai').assert;
var sinon = require('sinon');

describe('Bracket drawing', function () {
    var paper, raphael;

    beforeEach(function(){
        paper = {
            rect: function () {
                return {attr: function () {
                }}
            },
            text: function () {
                return {attr: function () {
                }}
            },
            getFont: function () {
                return {}
            }
        };
        paper.path = sinon.spy();

        raphael = new R2B();
    });

    it('should draw a message if bracket is non existent', function () {
        //setup
        var attrSpy = sinon.spy();
        var paper = {rect: function () {
        }, text: function () {
            return {attr: attrSpy}
        }, getFont: function () {
            return {family: 'Times', weight: 800, style: 'italic'}
        }};
        var raphael = new R2B();
        var bracket = null;
        sinon.spy(paper, 'rect');
        sinon.spy(paper, 'text');
        //action
        raphael.drawBracket(paper, bracket);
        //assert
        assert.equal(paper.rect.called, false);
        assert.equal(paper.text.getCall(0).args[0], 150);
        assert.equal(paper.text.getCall(0).args[1], 50);
        assert.equal(paper.text.getCall(0).args[2], 'Tournament has not begun yet!');
        assert.equal(attrSpy.getCall(0).args[0]['font-size'], 20);
        assert.equal(attrSpy.getCall(0).args[0]['font-weight'], 900);
    });

    it('should display a one-match bracket with player names, score and winner', function () {
        //setup
        var drawPlayerSlotSpy = sinon.spy();
        raphael.drawPlayerSlot = drawPlayerSlotSpy;
        sinon.spy(raphael, 'drawLinkBetweenSlots');
        var bracket = {1: {
            player1: {name: 'john'},
            player2: {name: 'jane'},
            score1: 2,
            score2: 0,
            complete: true
        }};
        //action
        raphael.drawBracket(paper, bracket);
        //assert
        assert.equal(drawPlayerSlotSpy.getCall(0).args[0], paper);
        assert.equal(drawPlayerSlotSpy.getCall(0).args[1], 50);
        assert.equal(drawPlayerSlotSpy.getCall(0).args[2], 50);
        assert.equal(drawPlayerSlotSpy.getCall(0).args[3], 'john');
        assert.equal(drawPlayerSlotSpy.getCall(0).args[4], 2);
        assert.equal(drawPlayerSlotSpy.getCall(1).args[0], paper);
        assert.equal(drawPlayerSlotSpy.getCall(1).args[1], 50);
        assert.equal(drawPlayerSlotSpy.getCall(1).args[2], 75);
        assert.equal(drawPlayerSlotSpy.getCall(1).args[3], 'jane');
        assert.equal(drawPlayerSlotSpy.getCall(1).args[4], 0);
        assert.equal(raphael.drawLinkBetweenSlots.getCall(0).args[0], paper);
        assert.equal(raphael.drawLinkBetweenSlots.getCall(0).args[1], 50);
        assert.equal(raphael.drawLinkBetweenSlots.getCall(0).args[2], 50);
        assert.equal(paper.path.getCall(0).args[0], 'M 150 60 l 10 0 l 0 25 l -10 0');
    });

    it('should display TBD if no player name is available for that slot', function () {
        //setup
        paper.path = sinon.spy();
        var bracket = {1: {
            player1: null,
            player2: null
        }};
        sinon.spy(raphael, 'drawPlayerSlot');
        //action
        raphael.drawBracket(paper, bracket);
        //assert
        assert.equal(raphael.drawPlayerSlot.getCall(0).args[3], 'TBD');
        assert.equal(raphael.drawPlayerSlot.getCall(1).args[3], 'TBD');
    });

    it('should draw matches in different columns when switching to another round', function () {
        //setup
        sinon.spy(raphael, 'drawPlayerSlot');
        sinon.spy(raphael, 'drawLinkBetweenSlots');
        var bracket = {1: {
            player1: {name: 'john'},
            player2: {name: 'jane'},
            complete: false,
            round:8
        }, 2: {
            player1: {name: 'alice'},
            player2: {name: 'bob'},
            complete: false,
            round:4
        }};
        //action
        raphael.drawBracket(paper, bracket);
        //assert
        assert.equal(raphael.drawPlayerSlot.getCall(2).args[0], paper);
        assert.equal(raphael.drawPlayerSlot.getCall(2).args[1], 200);
        assert.equal(raphael.drawPlayerSlot.getCall(2).args[2], 50);
        assert.equal(raphael.drawPlayerSlot.getCall(3).args[0], paper);
        assert.equal(raphael.drawPlayerSlot.getCall(3).args[1], 200);
        assert.equal(raphael.drawPlayerSlot.getCall(3).args[2], 75);
    });
});


//var paper = Raphael("bracket", '100%', '100%');
//var rect1 = paper.rect(20,30,100,12).attr({fill: "orange"});
//var rect2 = paper.rect(20, 60, 100, 12).attr({fill:'blue'});
