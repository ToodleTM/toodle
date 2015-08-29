'use strict';
var D3Bracket = function () {
};
var _ = require('../../../node_modules/lodash/index.js');


//recursively runs through the bracket until initial matches are found,
// then places these matches in the 'children' array of their upcoming match
// in the tree structure, and so on
function insertNodes(currentNode, bracket) {
    var children = _.filter(bracket, function (item) {
        return currentNode.number === item.next;
    });
    var result = {};
    var previousMatches = _.filter(bracket, function (item) {
        return item.next === currentNode.number;
    });

    result.player1 = currentNode.player1;
    result.player2 = currentNode.player2;
    result.name = currentNode.number;
    result.parent = currentNode.next || null;
    result.complete = currentNode.complete;
    result.forfeit = currentNode.forfeit;
    result.winner = currentNode.winner;
    result.canReport = !currentNode.complete && _.every(previousMatches, function (item) {
            return item.complete;
        });
    result.defwin = currentNode.defwin;
    result.score1 = currentNode.score1;
    result.score2 = currentNode.score2;

    if (children.length) {
        result.children = [];
        _.forEach(children, function (child) {
            result.children.push(insertNodes(child, bracket));
        });
    }
    return result;
}

D3Bracket.prototype.convertBracketToD3Tree = function (bracket) {
    var transformedBracket = {};
    var root = _.find(bracket, function (item) {
        return item.next === undefined;
    });
    if (root) {
        transformedBracket = insertNodes(root, bracket);
    }
    return transformedBracket;
};

D3Bracket.prototype.WIDTH = 1400;
D3Bracket.prototype.HEIGHT = 700;
var NODE_TEXT_LEFT_MARGIN = 25;

var NODE_WIDTH = 150;
var NODE_HEIGHT = 40;
var TEXT_IN_NODE_VALIGN_TOP = -5;
var TEXT_IN_NODE_VALIGN_BOTTOM = 15;
var NODE_FILL_COLOR = '#fff';
var NODE_INNER_SEPARATION_COLOR = '#ddd';
var NODE_OUTER_COLOR_FINISHED = '#096';
var NODE_OUTER_COLOR_ONGOING = '#09f';
var NODE_OUTER_COLOR_FORFEIT = '#f96';
var NODE_OUTER_COLOR = '#ccd';

var TREE_LEVELS_HORIZONTAL_DEPTH = 300;

var TOURNAMENT_PRIVILEGES_ALL = 3;
var TOURNAMENT_PRIVILEGES_REPORT_ONLY = 2;

D3Bracket.prototype.chooseOuterNodeColor = function (d) {
    return (d.forfeit ? NODE_OUTER_COLOR_FORFEIT : d.complete ? NODE_OUTER_COLOR_FINISHED :
        d.canReport ? NODE_OUTER_COLOR_ONGOING : NODE_OUTER_COLOR);
};

function matchCanBeUnreported(d) {
    return !d.defwin && d.complete && (!d.parent || (d.parent && !d.parent.complete));
}

function playerCanAtLeastReport(d, reportingRights) {
    return !d.defwin && d.canReport && (reportingRights === TOURNAMENT_PRIVILEGES_ALL || reportingRights === TOURNAMENT_PRIVILEGES_REPORT_ONLY);
}
function playerCanReportAndUnreport(d, reportingRights) {
    return !d.defwin && matchCanBeUnreported(d) && reportingRights === TOURNAMENT_PRIVILEGES_ALL;
}

D3Bracket.prototype.getReportingButtonIcon = function (d, reportingRights) {
    var icon = '';
    if (playerCanAtLeastReport(d, reportingRights)) {
        icon = '/images/edit.png';
    } else if (playerCanReportAndUnreport(d, reportingRights)) {
        icon = '/images/delete.png';
    }
    return icon;
};

D3Bracket.prototype.triggerReportingEvent = function (node, reportingTrigger, unreportingTrigger) {
    if (node.canReport) {
        reportingTrigger(node);
    } else if (matchCanBeUnreported(node)) {
        unreportingTrigger(node);
    }
};

D3Bracket.prototype.drawSingleNode = function (nodeEnter, lineFunction, reportingTrigger, unreportingTrigger, reportingRights) {
    var pathForDrawingCell = [
        {x: 0, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: NODE_HEIGHT / 2},
        {x: 0, y: NODE_HEIGHT / 2},
        {x: 0, y: -NODE_HEIGHT / 2}
    ];
    var self = this;
    nodeEnter.append('path')
        .attr('d', lineFunction(pathForDrawingCell))
        .attr('stroke', this.chooseOuterNodeColor)
        .attr('stroke-width', 2)
        .attr('fill', NODE_FILL_COLOR);

    nodeEnter.append('path')
        .attr('d', lineFunction([
            {x: 0, y: 0},
            {x: NODE_WIDTH, y: 0}
        ]))
        .attr('stroke', NODE_INNER_SEPARATION_COLOR)
        .attr('stroke-width', 1);

    nodeEnter.append('svg:image')
        .attr('class', 'circle')
        .attr('xlink:href', function (d) {
            return self.getReportingButtonIcon(d, reportingRights);
        })
        .attr('id', function (d) {
            return 'matchNumber-' + d.name;
        })
        .attr('x', NODE_WIDTH + 'px')
        .attr('y', '-10px')
        .attr('width', '20px')
        .attr('height', '20px')
        .style('cursor', 'pointer')
        .on('click', function (d) {
            if (playerCanAtLeastReport(d, reportingRights) || playerCanReportAndUnreport(d, reportingRights)) {
                self.triggerReportingEvent(d, reportingTrigger, unreportingTrigger);
            }
        });
};
D3Bracket.prototype.firstPlayerToSwapPosition = null;

D3Bracket.prototype.selectPlayerToSwap = function (node, swapCallback, slot1) {
    var playerSlot = slot1 ? 'player1' : 'player2';
    var currentPlayer = node[playerSlot];
    var swapIcon = '/images/swapPlayers.png';
    var selectedIcon = '/images/selectedPlayer.png';
    var clickable = '/images/clickable.png';
    var clicked = '/images/clicked.png';
    var slotNumber = slot1 ? 1 : 2;
    if (!this.firstPlayerToSwapPosition) {
        this.firstPlayerToSwapPosition = {
            number: node.name,
            playerNumber:slotNumber,
            isPlayer1: slot1,
            name: currentPlayer ? currentPlayer.name : null
        };
        document.getElementById('matchNumber-' + node.name + '-' + slotNumber).setAttribute('href', selectedIcon);
        document.getElementById('clickable-' + node.name + '-' + slotNumber).setAttribute('href', clicked);
    } else {
        if (this.firstPlayerToSwapPosition.number === node.name && this.firstPlayerToSwapPosition.isPlayer1 === slot1) {
            this.firstPlayerToSwapPosition = null;
            document.getElementById('matchNumber-' + node.name + '-' + slotNumber).setAttribute('href', swapIcon);
            document.getElementById('clickable-' + node.name + '-' + slotNumber).setAttribute('href', clickable);
        } else {
            var secondPlayerToSwapPosition = {
                number: node.name,
                playerNumber:slotNumber,
                isPlayer1: slot1,
                name: currentPlayer ? currentPlayer.name : null
            };
            swapCallback([this.firstPlayerToSwapPosition, secondPlayerToSwapPosition]);
            this.firstPlayerToSwapPosition = null;
        }
    }
};

D3Bracket.prototype.drawPreconfigureNode = function (nodeEnter, lineFunction, swapTriggerCallback) {
    var pathForDrawingCell = [
        {x: 0, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: NODE_HEIGHT / 2},
        {x: 0, y: NODE_HEIGHT / 2},
        {x: 0, y: -NODE_HEIGHT / 2}
    ];
    var self = this;
    nodeEnter.append('path')
        .attr('d', lineFunction(pathForDrawingCell))
        .attr('stroke', NODE_OUTER_COLOR)
        .attr('stroke-width', 2)
        .attr('fill', NODE_FILL_COLOR);

    nodeEnter.append('path')
        .attr('d', lineFunction([
            {x: 0, y: 0},
            {x: NODE_WIDTH, y: 0}
        ]))
        .attr('stroke', NODE_INNER_SEPARATION_COLOR)
        .attr('stroke-width', 1);

    var swapIcon = '/images/swapPlayers.png';

    nodeEnter.append('svg:image')
        .attr('class', 'circle')
        .attr('xlink:href', swapIcon)
        .attr('id', function (d) {
            return 'matchNumber-' + d.name + '-1';
        })
        .attr('x', (NODE_WIDTH - 7) + 'px')
        .attr('y', '-18px')
        .attr('width', '15px')
        .attr('height', '15px')
        .style('cursor', 'pointer')
        .on('click', function (d) {
            self.selectPlayerToSwap(d, swapTriggerCallback, true);
        });

    nodeEnter.append('svg:image')
        .attr('class', 'circle')
        .attr('xlink:href', swapIcon)
        .attr('id', function (d) {
            return 'matchNumber-' + d.name + '-2';
        })
        .attr('x', (NODE_WIDTH - 7) + 'px')
        .attr('y', '3px')
        .attr('width', '15px')
        .attr('height', '15px')
        .style('cursor', 'pointer')
        .on('click', function (d) {
            self.selectPlayerToSwap(d, swapTriggerCallback, false);
        });
};

D3Bracket.prototype.getTextToDraw = function (playerData, playerScore) {
    if (!playerData) {
        return ' - ';
    } else if (!playerScore && playerScore !== 0) {
        return ' -  ' + playerData.name;
    } else {
        return playerScore + '  ' + playerData.name;
    }
};

D3Bracket.prototype.getIconToShow = function (d, player1) {
    if (player1) {
        if (d.player1 && d.player1.faction) {
            return '/images/icon-' + d.player1.faction + '.png';
        }
    } else if (d.player2 && d.player2.faction) {
        return '/images/icon-' + d.player2.faction + '.png';
    }
    return '';
};

D3Bracket.prototype.getFontWeightForPlayerName = function (node) {
    var matchCompleted = node.complete,
        playerScore = node.playerScore,
        opponentScore = node.opponentScore,
        forfeit = node.forfeit,
        winner = node.winner,
        currentSlot = node.currentSlot,
        valueToReturn = '';
    if (matchCompleted) {
        if (forfeit) {
            if(winner === currentSlot){
                valueToReturn = '900';
            }
        } else {
            if (playerScore > opponentScore) {
                valueToReturn = '900';
            }
        }
    }
    return valueToReturn;
};

function appendTextToNode(node, textVAlign) {
    return node.append('text')
        .attr('x', function () {
            return NODE_TEXT_LEFT_MARGIN;
        })
        .attr('y', function () {
            return textVAlign;
        })
        .attr('text-anchor', function () {
            return 'start';
        })
        .style('fill-opacity', 1)
        .style('cursor', 'pointer');
}

D3Bracket.prototype.drawFirstPlayerNameInNode = function (nodes, callback, preconfigureMode) {
    var that = this;
    var appendedText = appendTextToNode(nodes, TEXT_IN_NODE_VALIGN_TOP, that);
    appendedText
        .text(function (d) {
            return that.getTextToDraw(d.player1, d.score1);
        })
        .style('font-weight', function (d) {
            return that.getFontWeightForPlayerName({
                complete: d.complete,
                playerScore: d.score1,
                opponentScore: d.score2,
                forfeit: d.forfeit, winner: d.winner,currentSlot:1
            });
        })
        .style('font-style', function (d) {
            return d.winner !== 1 && d.forfeit ? 'italic' : '';
        })
        .style('text-decoration', function (d) {
            return d.winner !== 1 && d.forfeit ? 'line-through' : '';
        })
        .attr('id', function (d) {
            return 'player1-for-match-' + d.name;
        });
    nodes.append('svg:image')
        .attr('xlink:href', '/images/clickable.png')
        .attr('id', function (d) {
            return 'clickable-' + d.name + '-1';
        })
        .attr('x', '0px')
        .attr('y', '-20px')
        .attr('width', '150px')
        .attr('height', '20px')
        .attr('cursor', function () {
            return preconfigureMode ? 'pointer' : 'crosshair';
        })
        .on('click', function (d) {
            if (preconfigureMode) {
                that.selectPlayerToSwap(d, callback.swapPlayers, true);
            } else {
                callback.togglePlayerHighlight(d.player1);
            }
        });

    nodes.append('svg:image')
        .attr('class', 'circle')
        .attr('xlink:href', function (d) {
            return that.getIconToShow(d, true);
        })
        .attr('x', '0px')
        .attr('y', '-20px')
        .attr('width', '20px')
        .attr('height', '20px');
};

D3Bracket.prototype.drawSecondPlayerNameInNode = function (nodes, callback, preconfigureMode) {
    var that = this;
    var appendedText = appendTextToNode(nodes, TEXT_IN_NODE_VALIGN_BOTTOM, that);
    appendedText
        .text(function (d) {
            return that.getTextToDraw(d.player2, d.score2);
        })
        .style('font-weight', function (d) {
            return that.getFontWeightForPlayerName({
                complete: d.complete,
                playerScore: d.score2,
                opponentScore: d.score1,
                forfeit: d.forfeit,
                winner: d.winner,
                currentSlot:2
            });
        })
        .style('font-style', function (d) {
            return d.winner !== 2 && d.forfeit ? 'italic' : '';
        })
        .style('text-decoration', function (d) {
            return d.winner !== 2 && d.forfeit ? 'line-through' : '';
        })
        .attr('id', function (d) {
            return 'player2-for-match-' + d.name;
        });

    nodes.append('svg:image')
        .attr('xlink:href', '/images/clickable.png')
        .attr('id', function (d) {
            return 'clickable-' + d.name + '-2';
        })
        .attr('x', '0px')
        .attr('y', '0px')
        .attr('width', '150px')
        .attr('height', '20px')
        .attr('cursor', function () {
            return preconfigureMode ? 'pointer' : 'crosshair';
        })
        .on('click', function (d) {
            if (preconfigureMode) {
                that.selectPlayerToSwap(d, callback.swapPlayers, false);
            } else {
                callback.togglePlayerHighlight(d.player2);
            }
        });

    nodes.append('svg:image')
        .attr('class', 'circle')
        .attr('xlink:href', function (d) {
            return that.getIconToShow(d, false);
        })
        .attr('x', '0px')
        .attr('y', '0px')
        .attr('width', '20px')
        .attr('height', '20px');
};

D3Bracket.prototype.getLineDots = function (nodeData) {
    var nextMatch = {x: nodeData.source.y, y: nodeData.source.x};
    var joiningPoint = {x: nodeData.source.y - NODE_WIDTH / 2, y: nodeData.source.x};
    var lineFromLowerMatch = {x: nodeData.source.y - NODE_WIDTH / 2, y: nodeData.target.x};
    var originMatch = {x: nodeData.target.y + NODE_WIDTH, y: nodeData.target.x};
    return [nextMatch, joiningPoint, lineFromLowerMatch, originMatch];
};

D3Bracket.prototype.getUnhighlightedLineDots = function (nodeData) {
    var joiningPoint = {x: nodeData.source.y - NODE_WIDTH / 2, y: nodeData.source.x + 2};//adjusted y coordinates to avoid overlapping of highlight / non-highlight arcs
    var lineFromLowerMatch = {x: nodeData.source.y - NODE_WIDTH / 2, y: nodeData.target.x};
    var originMatch = {x: nodeData.target.y + NODE_WIDTH, y: nodeData.target.x};
    return [joiningPoint, lineFromLowerMatch, originMatch];
};

D3Bracket.prototype.computeArc = function (d) {
    var lineDots = [];
    if (d.source.highlight || d.target.highlight) {
        if (d.source.highlight && d.target.highlight) {
            lineDots = this.getLineDots(d);
        } else {
            lineDots = this.getUnhighlightedLineDots(d);
        }
    } else {
        lineDots = this.getLineDots(d);
    }
    return lineDots;
};

D3Bracket.prototype.markHighlightedNodes = function (link, playerToHighlight) {
    if (link[0] && link[0].parentNode.childNodes && playerToHighlight) {
        _.forEach(link[0].parentNode.childNodes, function (node) {
            var actual = node.__data__;
            if (actual) {
                if (actual.player1 && actual.player1.name === playerToHighlight.name || actual.player2 && actual.player2.name === playerToHighlight.name) {
                    actual.highlight = true;
                }
            }
        });
    }
    return link;
};
D3Bracket.prototype.drawLinesBetweenNodes = function (svg, links, playerToHighlight) {
    var link = svg.selectAll('path.link')
        .data(links, function (d) {
            return d.target.id;
        });
    var self = this;
    var lineFunction = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate('linear');
    link = this.markHighlightedNodes(link, playerToHighlight);
    link.enter().insert('path', 'g')
        .attr('id', function (d) {
            return 'linkfrom-' + d.source.name + '-to-' + d.target.name;
        })
        .attr('class', function (d) {
            if (d.source.highlight && d.target.highlight) {
                return 'bracket-highlight';
            }
            return 'bracket-normalLink';
        })
        .attr('d', function (d) {
            return lineFunction(self.computeArc(d));
        });
};
D3Bracket.prototype.drawLine = function (d3) {
    var lineFunction = d3.svg.line().
        x(function (d) {
            return d.x;
        }).
        y(function (d) {
            return d.y;
        }).
        interpolate('linerar');
    return lineFunction;
};
D3Bracket.prototype.translateOrigin = function (node) {
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', function (d) {
            return 'translate(' + d.y + ',' + d.x + ')';
        });
    return nodeEnter;
};
D3Bracket.prototype.giveAnIdToEachNode = function (svg, nodes) {
    var i = 0;
    var node = svg.selectAll('g.node')
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });
    return node;
};
D3Bracket.prototype.appendSvgCanvas = function (margin, d3) {
    var svg = d3.select('#bracket').append('svg')
        .attr('width', this.WIDTH + margin.right + margin.left)
        .attr('height', this.HEIGHT + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    return svg;
};
D3Bracket.prototype.getWidth = function () {
    return this.WIDTH;
};
D3Bracket.prototype.getHeight = function () {
    return this.HEIGHT;
};
D3Bracket.prototype.setViewDimensions = function (bracket) {
    var numNodes = _.keys(bracket).length;
    var depth = Math.log(numNodes + 1) / Math.log(2);
    this.WIDTH = 300 * Math.round(depth);

    var baseHeight = NODE_HEIGHT + 5;
    var numberOfLeaves = numNodes ? numNodes / 2 + 1 : 0;
    var numberOfSpacesBetweenMatchSlots = Math.floor(numberOfLeaves / 2);
    this.HEIGHT = (numberOfLeaves + numberOfSpacesBetweenMatchSlots) * baseHeight;
};
D3Bracket.prototype.drawBracket = function (data, d3, controllerReference, playerToHighlight, preconfigureMode) {
    var bracket = data.bracket;
    var d3Nodes = this.convertBracketToD3Tree(bracket);
    var that = this;
    this.setViewDimensions(bracket);
    var tree = d3.layout.tree()
        .size([this.HEIGHT, this.WIDTH]);

    var nodes = tree.nodes(d3Nodes).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = that.WIDTH - 200 - d.depth * TREE_LEVELS_HORIZONTAL_DEPTH;
        d.x = d.x;
    });

    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var svg = this.appendSvgCanvas(margin, d3);
    var node = this.translateOrigin(this.giveAnIdToEachNode(svg, nodes));
    if (preconfigureMode) {
        this.drawPreconfigureNode(node, this.drawLine(d3), function (d) {
            controllerReference.swapPlayers(d);
        });
    } else {
        this.drawSingleNode(node, this.drawLine(d3), function (d) {
            controllerReference.report(d);
        }, function (d) {
            controllerReference.unreport(d);
        }, data.userPrivileges, preconfigureMode);
    }

    this.drawFirstPlayerNameInNode(node, controllerReference, preconfigureMode);
    this.drawSecondPlayerNameInNode(node, controllerReference, preconfigureMode);
    this.drawLinesBetweenNodes(svg, links, playerToHighlight);
};

D3Bracket.prototype.render = function (tournamentData, customRenderer, controllerCallbacks, playerToHighlight, preconfigureMode) {
    var bracketHtml = document.getElementById('bracket');
    if (bracketHtml) {
        document.getElementById('bracket').innerHTML = '';
        this.drawBracket(tournamentData, customRenderer, controllerCallbacks, playerToHighlight, preconfigureMode);
    }
};

module.exports.Renderer = D3Bracket;