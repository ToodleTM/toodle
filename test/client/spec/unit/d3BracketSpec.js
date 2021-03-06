'use strict';
var D3Bracket = require('../../../../app/scripts/utils/d3Bracket.js').Renderer;
var assert = require('chai').assert;
var sinon = require('sinon');

describe('D3ToBracket renderer', function () {
    var d3Bracket = null;
    beforeEach(function () {
        d3Bracket = new D3Bracket();
    });
    describe('Bracket conversion from toodle to D3', function () {
        it('should return an empty object if no data exists', function () {
            //setup
            var bracket = {};
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);
            //assert
            assert.equal(Object.keys(actual).length, 0);
        });

        it('should return an object w/ a single element if initial bracket contains one', function () {
            //setup
            var bracket = {
                1: {
                    number: 1,
                    player1: {name: 'john'},
                    player2: {name: 'jane'}
                }
            };
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);
            //assert
            assert.equal(actual.player1.name, 'john');
            assert.equal(actual.player2.name, 'jane');
            assert.equal(actual.parent, null);
            assert.equal(actual.children, null);
        });

        it('should correctly position a node and its children, children should refer to parent (1 level)', function () {
            //setup
            var bracket = {
                1: {
                    number: 1,
                    player1: {name: 'bob'},
                    player2: {name: 'alice'},
                    next: 3,
                    complete: true,
                    score1: 2,
                    score2: 0
                },
                2: {
                    number: 2,
                    player1: null,
                    player2: {name: 'frank'},
                    next: 3
                },
                3: {
                    number: 3,
                    player1: null,
                    player2: {name: 'frank'}
                }
            };
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);

            //assert
            assert.equal(actual.player1, null);
            assert.equal(actual.player2.name, 'frank');
            assert.equal(actual.canReport, false);
            assert.equal(actual.parent, null);
            assert.equal(actual.children.length, 2);
            assert.equal(actual.children[0].player1.name, 'bob');
            assert.equal(actual.children[0].player2.name, 'alice');
            assert.equal(actual.children[0].complete, true);
            assert.equal(actual.children[0].score1, 2);
            assert.equal(actual.children[0].score2, 0);
            assert.equal(actual.children[0].parent, 3);
            assert.equal(actual.children[1].player1, null);
            assert.equal(actual.children[1].player2.name, 'frank');
            assert.equal(actual.children[1].parent, 3);
        });

        it('should enable match report if all previous matches are completed and current match is not', function () {
            //setup
            var bracket = {
                1: {
                    number: 1,
                    player1: {name: 'bob'},
                    player2: {name: 'alice'},
                    next: 3,
                    complete: true,
                    score1: 2,
                    score2: 0
                },
                2: {
                    number: 2,
                    player1: null,
                    player2: {name: 'frank'},
                    next: 3,
                    complete: true,
                    score1: 2,
                    score2: 0
                },
                3: {
                    number: 3,
                    player1: null,
                    player2: {name: 'frank'}
                }
            };
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket, true);

            //assert
            assert.equal(actual.player1, null);
            assert.equal(actual.player2.name, 'frank');
            assert.equal(actual.parent, null);
            assert.equal(actual.canReport, true);
            assert.equal(actual.children.length, 2);
            assert.equal(actual.children[0].complete, true);
            assert.equal(actual.children[1].complete, true);
        });

        it('should allow reporting if current match is in the first round of the bracket and it has not yet been reported', function () {
            //setup
            var bracket = {
                1: {
                    number: 1,
                    player1: {name: 'john'},
                    player2: {name: 'jane'}
                }
            };
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);
            //assert
            assert.equal(actual.canReport, true);
        });

        it('should be able to link children to parents on multiple levels', function () {
            //setup
            var bracket = {
                1: {
                    number: 1,
                    player1: {name: 'mario'},
                    player2: {name: 'bowser'},
                    next: 5
                },
                2: {
                    number: 2,
                    player1: {name: 'mufassa'},
                    player2: {name: 'scar'},
                    next: 5
                },
                3: {
                    number: 3,
                    player1: null,
                    player2: null,
                    next: 6
                },
                4: {
                    number: 4,
                    player1: null,
                    player2: null,
                    next: 6
                },
                5: {
                    number: 5,
                    player1: {name: 'toad'},
                    player2: {name: 'peach'},
                    next: 7
                },
                6: {
                    number: 6,
                    player1: null,
                    player2: null,
                    next: 7
                },
                7: {
                    number: 7,
                    player1: {name: 'scrooge'},
                    player2: {name: 'donald'}
                }
            };
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);

            //assert
            assert.equal(actual.player1.name, 'scrooge');
            assert.equal(actual.player2.name, 'donald');
            assert.equal(actual.parent, null);
            assert.equal(actual.children.length, 2);

            assert.equal(actual.children[0].name, 5);
            assert.equal(actual.children[0].player1.name, 'toad');
            assert.equal(actual.children[0].player2.name, 'peach');
            assert.equal(actual.children[0].parent, 7);
            assert.equal(actual.children[0].children.length, 2);
            assert.equal(actual.children[0].children[0].name, 1);
            assert.equal(actual.children[0].children[0].player1.name, 'mario');
            assert.equal(actual.children[0].children[0].player2.name, 'bowser');
            assert.equal(actual.children[0].children[0].parent, 5);
            assert.equal(actual.children[0].children[1].name, 2);
            assert.equal(actual.children[0].children[1].player1.name, 'mufassa');
            assert.equal(actual.children[0].children[1].player2.name, 'scar');
            assert.equal(actual.children[0].children[1].parent, 5);

            assert.equal(actual.children[1].children.length, 2);
            assert.equal(actual.children[1].children[0].name, 3);
            assert.equal(actual.children[1].children[0].parent, 6);
            assert.equal(actual.children[1].children[1].name, 4);
            assert.equal(actual.children[1].children[1].parent, 6);
        });
    });
    describe('Bracket sizing according to bracket depth', function () {
        function testBracketDimensions(bracket, expectedWidth, expectedHeight) {
            //action
            d3Bracket.setViewDimensions(bracket);
            //assert
            assert.equal(d3Bracket.getWidth(), expectedWidth);
            assert.equal(d3Bracket.getHeight(), expectedHeight);
        }
        it('should define dimensions as 0/0 if bracket is empty (depth=0)', function () {
            //setup
            var bracket = {};
            sinon.spy(d3Bracket, 'setViewDimensions');
            testBracketDimensions(bracket, 0, 0);
        });

        it('should define a height that is directly proportional to the number of initial matches (depth=1)', function () {
            //setup
            var bracket = {
                1: {}
            };

            testBracketDimensions(bracket, 300, 67.5);
        });

        it('should define a height that is directly proportional to the number of initial matches (depth=3)', function(){
            var bracket = {
                1:{},2:{},3:{},4:{},5:{},6:{},7:{}
            };
            testBracketDimensions(bracket, 900, 292.5);
        });
    });
    describe('drawbracket function', function () {
        var d3 = {};
        var treeSize = null;
        var bracket = {
            1: {
                number: 1,
                player1: {name: 'mario'},
                player2: {name: 'bowser'},
                next: 5
            },
            2: {
                number: 2,
                player1: {name: 'mufassa'},
                player2: {name: 'scar'},
                next: 5
            },
            3: {
                number: 3,
                player1: null,
                player2: null,
                next: 6
            },
            4: {
                number: 4,
                player1: null,
                player2: null,
                next: 6
            },
            5: {
                number: 5,
                player1: {name: 'toad'},
                player2: {name: 'peach'},
                next: 7
            },
            6: {
                number: 6,
                player1: null,
                player2: null,
                next: 7
            },
            7: {
                number: 7,
                player1: {name: 'scrooge'},
                player2: {name: 'donald'}
            }
        };
        var append = null;
        var callCheck = null;
        beforeEach(function () {
            d3.layout =
            {
                tree: function () {
                    var tree = function () {
                    };
                    var size = function () {
                        var result = function () {
                        };
                        result.nodes = function () {
                            var result = function () {
                            };
                            result.reverse = function () {
                                return [];
                            };
                            return result;
                        };
                        result.links = function () {

                        };
                        return result;
                    };
                    tree.size = size;
                    treeSize = sinon.spy(tree, 'size');
                    return tree;
                }
            };

            d3.svg = {
                diagonal: function () {
                    var diagonal = function () {
                    };
                    var source = function () {
                        var source = function () {
                        };
                        var target = function () {
                            return function () {
                            };
                        };
                        source.target = target;
                        return source;
                    };
                    diagonal.source = source;
                    return diagonal;
                }
            };
            callCheck = sinon.spy();

            d3.select = function (a) {
                callCheck(a);
                var returnFunction = function () {
                };
                returnFunction.append = function (a) {
                    callCheck(a);
                    var attrFunc = function () {
                    };
                    attrFunc.attr = function (a, b) {
                        callCheck(a, b);
                        var secondAttrFunc = function () {
                        };
                        secondAttrFunc.attr = function (a, b) {
                            callCheck(a, b);

                            var appendFunc = function () {
                            };

                            appendFunc.append = function (a) {
                                callCheck(a);
                                var thirdAttrFunc = function () {
                                };
                                thirdAttrFunc.attr = function (a, b) {
                                    callCheck(a, b);
                                };
                                sinon.spy(thirdAttrFunc);
                                return thirdAttrFunc;
                            };
                            sinon.spy(appendFunc);
                            return appendFunc;
                        };
                        sinon.spy(secondAttrFunc);
                        return secondAttrFunc;
                    };
                    append = sinon.spy(attrFunc);
                    return append;
                };
                sinon.spy(returnFunction);
                return returnFunction;
            };
        });
        it('sets the canvas dimensions by calling setViewDimensions', function () {
            //setup

            d3Bracket.appendSvgCanvas = function () {
            };
            d3Bracket.translateOrigin = function () {
            };
            d3Bracket.giveAnIdToEachNode = function () {
            };
            d3Bracket.drawSingleNode = function () {
            };
            d3Bracket.drawLine = function () {
            };
            d3Bracket.drawFirstPlayerNameInNode = function () {
            };
            d3Bracket.drawSecondPlayerNameInNode = function () {
            };
            d3Bracket.drawLinesBetweenNodes = function () {
            };
            sinon.spy(d3Bracket, 'setViewDimensions');
            //action
            d3Bracket.drawBracket({bracket: bracket}, d3, function(){});
            //assert
            assert.equal(d3Bracket.setViewDimensions.calledOnce, true);
            assert.equal(treeSize.getCall(0).args[0][0], 292.5);
            assert.equal(treeSize.getCall(0).args[0][1], 900);
        });

        it('should set the svg canvas with the appropriate properties (width, height, margins) for a depth 3 bracket', function () {
            //setup

            d3Bracket.translateOrigin = function () {
            };
            d3Bracket.giveAnIdToEachNode = function () {
            };
            d3Bracket.drawSingleNode = function () {
            };
            d3Bracket.drawLine = function () {
            };
            d3Bracket.drawFirstPlayerNameInNode = function () {
            };
            d3Bracket.drawSecondPlayerNameInNode = function () {
            };
            d3Bracket.drawLinesBetweenNodes = function () {
            };

            sinon.spy(d3Bracket, 'appendSvgCanvas');

            //action
            d3Bracket.drawBracket({bracket: bracket}, d3, function(){});
            //assert
            assert.equal(d3Bracket.appendSvgCanvas.calledOnce, true);
            assert.equal(callCheck.getCall(1).args[0], 'svg');
            assert.equal(callCheck.getCall(2).args[0], 'width');
            assert.equal(callCheck.getCall(2).args[1], 900);
            assert.equal(callCheck.getCall(3).args[0], 'height');
            assert.equal(callCheck.getCall(3).args[1], 292.5);
            assert.equal(callCheck.getCall(5).args[0], 'transform');
            assert.equal(callCheck.getCall(5).args[1], 'translate(0,0)');
        });
    });
    describe('GetTextToDraw', function () {

        function testTextToDraw(playerData, playerScore, expectedText) {
            //action
            var actual = d3Bracket.getTextToDraw(playerData, playerScore);
            //assert
            assert.equal(actual, expectedText);
        }

        it('should return an empty placeholder if playerData is null', function () {
            testTextToDraw(null, null, ' - ');
        });

        it('should return a player name next to an empty score placeholder if player exists but there is no score yet', function () {
            testTextToDraw({name: 'player name'}, null, ' -  player name');
        });

        it('should return a player name _and_ a score if both exist', function () {
            testTextToDraw({name: 'player name'}, 1, '1  player name');
        });

        it('should display 0 if the score is actually 0', function (){
            testTextToDraw({name: 'player name'}, 0, '0  player name');
        });
    });

    describe('Faction icon display', function () {
        function testIconToShow(data, firstPlayerWanted, expectedIcon) {
            //action
            var actual = d3Bracket.getIconToShow(data, firstPlayerWanted);
            //assert
            assert.equal(actual, expectedIcon);
        }

        it('should return player1 s icon in a correctly formatted string if we re interested in player1', function () {
            //setup
            var d = {
                player1: {
                    faction: 'player1'
                },
                player2: {
                    faction: 'player2'
                }
            };
            testIconToShow(d, true, '/images/icon-player1.png');
        });
        it('should return player2 s icon in a correctly formatted string if we re not interested in player1', function () {
            //setup
            var d = {
                player1: {
                    faction: 'player1'
                },
                player2: {
                    faction: 'player2'
                }
            };
            testIconToShow(d, false, '/images/icon-player2.png');
        });
        it('should return a default icon if no player1 faction is specified', function () {
            //setup
            var d = {
                player1: {}
            };
            testIconToShow(d, true, '');
        });

        it('should return a default icon if no player2 faction is specified', function () {
            //setup
            var d = {
                player2: {}
            };
            testIconToShow(d, false, '');
        });

        it('should return the default icon if no player1 is defined and we re trying to display player1', function () {
            //setup
            var d = {};
            testIconToShow(d, true, '');
        });
        it('should return the default icon if no player2 is defined and we re trying to display player2', function () {
            //setup
            var d = {};
            testIconToShow(d, false, '');
        });
    });

    describe('ChooseOuterNodeColor', function () {
        function testColor(node, expectedColor) {
            //setup
            //action
            var actual = d3Bracket.chooseOuterNodeColor(node);
            //assert
            assert.equal(actual, expectedColor);
        }

        it('should use a green border color if the match is finished', function () {
            testColor({complete: true}, '#096');
        });

        it('should use an orange border color if the match is ongoing', function () {
            testColor({canReport: true}, '#09f');
        });

        it('should use a default border color if the match is upcoming', function () {
            testColor({}, '#ccd');
        });

        it('should display a green border if for some reason the match is "finished"_and_ "ongoing" (should not happen)', function () {
            testColor({complete: true, canReport: true}, '#096');
        });

        it('should display a green border if for some reason the match is "finished"_and_ "ongoing" (should not happen)', function () {
            testColor({forfeit: true}, '#f96');
        });
    });

    describe('GetLineDots', function () {
        it('should provide a path w/ sharp angles as in most bracket frameworks', function () {
            //setup
            var nodeData = {source: {x: 10, y: 20}, target: {x: 100, y: 200}};
            //action
            var actual = d3Bracket.getLineDots(nodeData);
            //assert
            assert.deepEqual(actual[0], {x: 20, y: 10});
            assert.deepEqual(actual[1], {x: -55, y: 10});
            assert.deepEqual(actual[2], {x: -55, y: 100});
            assert.deepEqual(actual[3], {x: 350, y: 100});
        });
    });
    describe('TriggerReportingEvent', function () {
        var reportTriggerSpy = null;
        var unreportTriggerSpy = null;
        beforeEach(function () {
            reportTriggerSpy = sinon.spy();
            unreportTriggerSpy = sinon.spy();
        });

        it('should trigger a report action if match can be reported', function () {
            //setup
            //action
            d3Bracket.triggerReportingEvent({canReport: true}, reportTriggerSpy, unreportTriggerSpy, 3);
            //assert
            assert.equal(reportTriggerSpy.calledOnce, true);
            assert.equal(unreportTriggerSpy.called, false);
        });
        it('should trigger an unreport action if match can be unreported', function () {
            //setup
            //action
            d3Bracket.triggerReportingEvent({complete: true, parent: {}}, reportTriggerSpy, unreportTriggerSpy);
            //assert
            assert.equal(unreportTriggerSpy.calledOnce, true);
            assert.equal(reportTriggerSpy.called, false);
        });

        it('should not trigger anything if match cant be reported or unreported', function () {
            //setup
            //action
            d3Bracket.triggerReportingEvent({}, reportTriggerSpy, unreportTriggerSpy);
            //assert
            assert.equal(unreportTriggerSpy.called, false);
            assert.equal(reportTriggerSpy.called, false);
        });

    });

    describe('GetReportingButtonIcon', function () {
        it('should return green if match can be reported', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({canReport: true, player1: {}, player2: {}}, 3);
            //assert
            assert.equal(actual, '/images/edit.png');
        });

        it('should return red if match can be unreported', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({complete: true, parent: {}, player1: {}, player2: {}}, 3);
            //assert
            assert.equal(actual, '/images/delete.png');
        });

        it('should not return red if match is in fact a defwin (1st player not defined)', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({complete: true, defwin:true, parent: {}, player1: null, player2: {}}, 3);
            //assert
            assert.equal(actual, '');
        });

        it('should not return red if match is in fact a defwin (2nd player not defined)', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({complete: true, defwin:true, parent: {}, player1: {}, player2: null}, 3);
            //assert
            assert.equal(actual, '');
        });

        it('should return nothing if match cant be reported / unreported', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({});
            //assert
            assert.equal(actual, '');
        });

        it('should display the unreporting button for the last match of a bracket', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({complete: true, parent: null, player1: {}, player2: {}}, 3);
            //assert
            assert.equal(actual, '/images/delete.png');
        });

        it('should not show the reporting button if admins did not give any reporting rights to the user', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({canReport: true}, 1);
            //assert
            assert.equal(actual, '');
        });

        it('should show the reporting button if admins gave "only reporting" rights to the user', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({canReport: true}, 2);
            //assert
            assert.equal(actual, '/images/edit.png');
        });

        it('should not show the unreporting button only if admins gave simple reporting rights to users', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({complete: true, parent: {}}, 2);
            //assert
            assert.equal(actual, '');
        });

        it('should not show the unreporting button only if admins gave no reporting rights to users', function () {
            //setup
            //action
            var actual = d3Bracket.getReportingButtonIcon({complete: true, parent: {}}, 1);
            //assert
            assert.equal(actual, '');
        });
    });

    describe('GetFontWidthForPlayerName', function () {
        it('should return an empty string if match is not complete', function () {
            //setup

            //action
            var actual = d3Bracket.getFontWeightForPlayerName({});
            //assert
            assert.equal(actual, '');
        });
        it('should return 900 for player 1 if match is complete and player 1 has won', function () {
            //setup
            var node = {complete: true, playerScore: 1, opponentScore: 0};
            //action
            var actual = d3Bracket.getFontWeightForPlayerName(node);
            //assert
            assert.equal(actual, '900');
        });
        it('should return 900 if match is flagged as "forfeit" and currentPlayer is advancing', function(){
            //setup
            var node = {complete: true, forfeit:true, winner:1, playerScore: 1, opponentScore: 1, currentSlot:1};
            //action
            var actual = d3Bracket.getFontWeightForPlayerName(node);
            //assert
            assert.equal(actual, '900');
        });
        it('should return an empty string if match is flagged as "forfeit" and currentPlayer is _not_ advancing', function () {
            //setup
            var node = {complete: true, forfeit: true, winner: 1, playerScore: 1, opponentScore: 1, currentSlot: 2};
            //action
            var actual = d3Bracket.getFontWeightForPlayerName(node);
            //assert
            assert.equal(actual, '');
        });
        it('should return an empty string if player has a better score than his opponent but has forfeit the tournament', function () {
            //setup
            var node = {complete: true, forfeit: true, winner: 1, playerScore: 2, opponentScore: 1, currentSlot: 2};
            //action
            var actual = d3Bracket.getFontWeightForPlayerName(node);
            //assert
            assert.equal(actual, '');
        });
    });

    describe('mark highlighed nodes', function () {
        function testHighlight(originalNode, playerToHighlight, expectedNode){
            //action
            var actual = d3Bracket.markHighlightedNodes(originalNode, playerToHighlight);
            //assert
            assert.deepEqual(actual, expectedNode);
        }

        it('should not mark any nodes if the node list is empty', function () {
            testHighlight({'0':{parentNode:{childNodes:{}}}}, null,{'0':{parentNode:{childNodes:{}}}});
        });

        it('should not mark any nodes if the player to highlight is not in the node list', function(){
            testHighlight({'0':{parentNode:{childNodes:{'0':{'__data__':{player1:{name:'tom'}, player2:{name:'john'}}}}}}}, {name:'bob'}, {'0':{parentNode:{childNodes:{'0':{'__data__':{player1:{name:'tom'}, player2:{name:'john'}}}}}}});
        });

        it('should mark a node if the player to highlight is a player1 in a match in the node list', function(){
            testHighlight({'0':{parentNode:{childNodes:{'0':{'__data__':{player1:{name:'bob'}, player2:{name:'john'}}}}}}}, {name:'bob'}, {'0':{parentNode:{childNodes:{'0':{'__data__':{highlight:true,player1:{name:'bob'}, player2:{name:'john'}}}}}}});
        });

        it('should mark a node if the player to highlight is a player2 in a match in the node list', function(){
            testHighlight({'0':{parentNode:{childNodes:{'0':{'__data__':{player1:{name:'bob'}, player2:{name:'john'}}}}}}}, {name:'john'}, {'0':{parentNode:{childNodes:{'0':{'__data__':{highlight:true,player1:{name:'bob'}, player2:{name:'john'}}}}}}});
        });

        it('should not mark any nodes if there is no player to highlight', function(){
            testHighlight({'0':{parentNode:{childNodes:{'0':{'__data__':{player1:{name:'bob'}, player2:{name:'john'}}}}}}}, null, {'0':{parentNode:{childNodes:{'0':{'__data__':{player1:{name:'bob'}, player2:{name:'john'}}}}}}});
        });

        it('should be able to mark the last childnode', function(){
            testHighlight({'0':{parentNode:{childNodes:{'1':{'__data__':{player1:{name:'martin'}, player2:{name:'alex'}}}, '2':{'__data__':{player1:{name:'julian'}, player2:{name:'guillaume'}}}, '3':{'__data__':{player1:{name:'bob'}, player2:{name:'john'}}}}}}}, {name:'john'}, {'0':{parentNode:{childNodes:{'1':{'__data__':{player1:{name:'martin'}, player2:{name:'alex'}}}, '2':{'__data__':{player1:{name:'julian'}, player2:{name:'guillaume'}}}, '3':{'__data__':{highlight:true,player1:{name:'bob'}, player2:{name:'john'}}}}}}});
        });

        it('should bypass nodes without __data__ properties', function(){
            testHighlight({'0':{parentNode:{childNodes:{'0':{}, '1':{'__data__':{player1:{name:'bob'}, player2:{name:'john'}}}}}}}, {name:'bob'}, {'0':{parentNode:{childNodes:{'0':{}, '1':{'__data__':{highlight:true,player1:{name:'bob'}, player2:{name:'john'}}}}}}});
        });

        it('should be able to handle matches w/ a player1 missing', function(){
            testHighlight({'0':{parentNode:{childNodes:{'1':{'__data__':{player2:{name:'john'}}}}}}}, {name:'bob'}, {'0':{parentNode:{childNodes:{'1':{'__data__':{player2:{name:'john'}}}}}}});
        });

        it('should be able to handle matches w/ a player2 missing', function(){
            testHighlight({'0':{parentNode:{childNodes:{'1':{'__data__':{player1:{name:'john'}}}}}}}, {name:'bob'}, {'0':{parentNode:{childNodes:{'1':{'__data__':{player1:{name:'john'}}}}}}});
        });
    });

});