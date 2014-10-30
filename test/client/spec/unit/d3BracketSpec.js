var D3Bracket = require('../../../../app/scripts/utils/d3Bracket.js').D3Bracket;
var assert = require('chai').assert;
var sinon = require('sinon');

describe('D3ToBracket', function () {
    describe('Bracket conversion from toodle to D3', function () {
        it('should return an empty object if no data exists', function () {
            //setup
            var d3Bracket = new D3Bracket();
            var bracket = {};
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);
            //assert
            assert.equal(Object.keys(actual).length, 0);
        });

        it('should return an object w/ a single element if initial bracket contains one', function () {
            //setup
            var d3Bracket = new D3Bracket();
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
            assert.equal(actual.parent, 'null');
            assert.equal(actual.children, null);
        });

        it('should correctly position a node and its children, children should refer to parent (1 level)', function () {
            //setup
            var d3Bracket = new D3Bracket();
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
            assert.equal(actual.parent, 'null');
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
            var d3Bracket = new D3Bracket();
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
            assert.equal(actual.parent, 'null');
            assert.equal(actual.canReport, true);
            assert.equal(actual.children.length, 2);
            assert.equal(actual.children[0].complete, true);
            assert.equal(actual.children[1].complete, true);
        });

        it('should allow reporting if current match is in the first round of the bracket and it has not yet been reported', function () {
            //setup
            var d3Bracket = new D3Bracket();
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
            var d3Bracket = new D3Bracket();
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
            assert.equal(actual.parent, 'null');
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
        it('should define a length of 400px and a height of 200px if the bracket is of depth = 1', function () {
            //setup
            var d3Bracket = new D3Bracket();
            var bracket = {
                1: {}
            };
            //action
            d3Bracket.setViewDimensions(bracket);
            //assert
            assert.equal(d3Bracket.getWidth(), 400);
            assert.equal(d3Bracket.getHeight(), 200);
        });

        it('should define dimensions L1200 / H600 if the bracket is of depth 3', function () {
            //setup
            var d3Bracket = new D3Bracket();
            var bracket = {
                1: {},
                2: {},
                3: {},
                4: {},
                5: {},
                6: {},
                7: {}
            };
            //action
            d3Bracket.setViewDimensions(bracket);
            //assert
            assert.equal(d3Bracket.getWidth(), 1200);
            assert.equal(d3Bracket.getHeight(), 600);
        });

        it('should define dimensions as 0/0 if bracket is empty', function () {
            //setup
            var d3Bracket = new D3Bracket();
            var bracket = {};
            sinon.spy(d3Bracket, 'setViewDimensions')
            //action
            d3Bracket.setViewDimensions(bracket);
            //assert
            assert.equal(d3Bracket.getWidth(), 0);
            assert.equal(d3Bracket.getHeight(), 0);
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
        var firstAttrFunction = null;
        var append = null;
        var callCheck = null;
        beforeEach(function () {
            d3.layout =
            {
                tree: function () {
                    function tree() {
                    };
                    var size = function () {
                        var result = function () {
                        };
                        result.nodes = function () {
                            var result = function () {
                            }
                            result.reverse = function () {
                                return [];
                            }
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
                    function result() {
                    };
                    result.projection = function () {
                    };
                    return result;
                }
            };
            callCheck = sinon.spy();

            d3.select = function(a){
                callCheck(a);
                var returnFunction = function(){};
                returnFunction.append = function(a){
                    callCheck(a);
                    var attrFunc = function(){};
                    attrFunc.attr = function(a, b){
                        callCheck(a, b);
                        var secondAttrFunc = function(){};
                        secondAttrFunc.attr = function(a, b){
                            callCheck(a, b);

                            var appendFunc = function(){}

                            appendFunc.append = function(a){
                                callCheck(a);
                                var thirdAttrFunc = function(){}
                                thirdAttrFunc.attr = function(a, b){
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
            var d3Bracket = new D3Bracket();

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
            d3Bracket.drawPlayerNameInNode = function () {
            };
            d3Bracket.drawPlayerNameInNode = function () {
            };
            d3Bracket.drawLinesBetweenNodes = function () {
            };
            sinon.spy(d3Bracket, 'setViewDimensions');
            //action
            d3Bracket.drawBracket(bracket, d3);
            //assert
            assert.equal(d3Bracket.setViewDimensions.calledOnce, true);
            assert.equal(treeSize.getCall(0).args[0][0], 600);
            assert.equal(treeSize.getCall(0).args[0][1], 1200);
        });

        it('should set the svg canvas with the appropriate properties (width, height, margins) for a depth 3 bracket', function(){
            //setup
            var d3Bracket = new D3Bracket();

            d3Bracket.translateOrigin = function () {
            };
            d3Bracket.giveAnIdToEachNode = function () {
            };
            d3Bracket.drawSingleNode = function () {
            };
            d3Bracket.drawLine = function () {
            };
            d3Bracket.drawPlayerNameInNode = function () {
            };
            d3Bracket.drawPlayerNameInNode = function () {
            };
            d3Bracket.drawLinesBetweenNodes = function () {
            };

            sinon.spy(d3Bracket, 'appendSvgCanvas');

            //action
            d3Bracket.drawBracket(bracket, d3);
            //assert
            assert.equal(d3Bracket.appendSvgCanvas.calledOnce, true);
            assert.equal(callCheck.getCall(1).args[0], 'svg');
            assert.equal(callCheck.getCall(2).args[0], 'width');
            assert.equal(callCheck.getCall(2).args[1], 1200);
            assert.equal(callCheck.getCall(3).args[0], 'height');
            assert.equal(callCheck.getCall(3).args[1], 600);
            assert.equal(callCheck.getCall(5).args[0], 'transform');
            assert.equal(callCheck.getCall(5).args[1], 'translate(0,0)');
        });
    })
});