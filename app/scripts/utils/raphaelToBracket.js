var RaphaelToBracket = function () {
};
var SLOT_WIDTH = 100;
var SLOT_HEIGHT = 20;
var MATCH_SPACING_HEIGHT = 5;

const TEXT_ATTRIBUTES = {'font-size': 12, 'font-weight': 800, 'text-anchor': 'start'};
const TO_BE_DECIDED = 'TBD';
const PLAYER_BOX_COLOR = '#269';
const HORIZONTAL_SPACE_BETWEEN_ROUNDS = 150;

const X_COORD_DRAW_START = 50;
const Y_COORD_DRAW_START = 50;


RaphaelToBracket.prototype.drawPlayerSlot = function (paper, baseX, baseY, name, score) {

    paper.rect(baseX, baseY, SLOT_WIDTH, SLOT_HEIGHT).attr({stroke: PLAYER_BOX_COLOR, 'stroke-width': 2});
    paper.text(baseX + 5, baseY + 10, name).attr(TEXT_ATTRIBUTES);
//    if()
//    if (score) {
//        paper.text(baseX + 100, baseY + 10, score).attr(TEXT_ATTRIBUTES);
//    }
};

RaphaelToBracket.prototype.drawBracket = function (paper, bracket) {
    function getPlayerNameOrPlaceHolder(player) {
        return player ? player.name : TO_BE_DECIDED;
    }

    if (bracket && Object.keys(bracket).length) {
        var currentRound = bracket[1].round;
        var xPositionForSlot = X_COORD_DRAW_START;
        var yPositionForSlot = Y_COORD_DRAW_START;
        const cellAndSpaceHeight = SLOT_HEIGHT+MATCH_SPACING_HEIGHT;
        const yOriginSecondPlayer = yPositionForSlot + cellAndSpaceHeight;
        var verticalSpaceBetweenRounds = 75;
        var matchHeight = 75;
        var count = 0;
        var that = this;
        Object.keys(bracket).forEach(function (key) {
            if (bracket[key].round != currentRound) {
                xPositionForSlot += HORIZONTAL_SPACE_BETWEEN_ROUNDS;
                //yPositionForSlot += verticalSpaceBetweenRounds;
                verticalSpaceBetweenRounds /= 2;
                currentRound = bracket[key].round;
                count = 0;
            }
            that.drawPlayerSlot(paper, xPositionForSlot, yPositionForSlot + matchHeight * count, getPlayerNameOrPlaceHolder(bracket[key].player1), bracket[key].score1);
            that.drawPlayerSlot(paper, xPositionForSlot, yPositionForSlot + cellAndSpaceHeight + matchHeight * count, getPlayerNameOrPlaceHolder(bracket[key].player2), bracket[key].score2);
            that.drawLinkBetweenSlots(paper, xPositionForSlot, yPositionForSlot + yOriginSecondPlayer * count);
//            console.log(bracket[key], count, count%2);
//            if(count%2==0 && bracket[key].next){
//                that.drawLinkBetweenRounds(paper, xPositionForSlot, 50+75*count);
//            }
            count++;
        });

    } else {
        paper.text(150, 50, 'Tournament has not begun yet!').attr({'font-size': 20, 'font-weight': 900, 'text-anchor': 'start'});
    }
};

//RaphaelToBracket.prototype.drawLinkBetweenRounds = function(paper, slotX, slotY){
//    paper.path('M '+(slotX+110)+' '+(slotY+20)+' l 10 0 l 0 75 l -10 0');
//};

RaphaelToBracket.prototype.drawLinkBetweenSlots = function (paper, slotX, slotY) {
    paper.path('M ' + (slotX + 100) + ' ' + (slotY + 10) + ' l 10 0 l 0 25 l -10 0');
};

module.exports.RaphaelToBracket = RaphaelToBracket;