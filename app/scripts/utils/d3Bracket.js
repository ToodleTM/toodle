'use strict';
var D3Bracket = function () {
};
var _ = require('../../../node_modules/lodash/lodash.js');


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
    result.parent = currentNode.next || 'null';
    result.complete = currentNode.complete;
    result.canReport = !currentNode.complete && _.every(previousMatches, function (item) {
        return item.complete;
    });
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
var NODE_OUTER_COLOR_FINISHED = '#8c8';
var NODE_OUTER_COLOR_ONGOING = 'orange';
var NODE_OUTER_COLOR = '#ccd';

var TREE_LEVELS_HORIZONTAL_DEPTH = 300;

var TOURNAMENT_PRIVILEGES_ALL = 3;
var TOURNAMENT_PRIVILEGES_REPORT_ONLY = 2;

D3Bracket.prototype.chooseOuterNodeColor = function (d) {
    return (d.complete ? NODE_OUTER_COLOR_FINISHED :
        d.canReport ? NODE_OUTER_COLOR_ONGOING : NODE_OUTER_COLOR);
};

function matchCanBeUnreported(d) {
    return d.complete && (!d.parent || (d.parent && !d.parent.complete));
}
D3Bracket.prototype.getReportingButtonIcon = function (d, reportingRights) {
    var icon = '';
    if (d.canReport && (reportingRights === TOURNAMENT_PRIVILEGES_ALL || reportingRights === TOURNAMENT_PRIVILEGES_REPORT_ONLY)) {
        icon = '/images/circle-green.png';
    } else if (matchCanBeUnreported(d) && reportingRights === TOURNAMENT_PRIVILEGES_ALL) {
        icon = '/images/circle-red.png';
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
        .attr('x', (NODE_WIDTH - 7) + 'px')
        .attr('y', '-27px')
        .attr('width', '15px')
        .attr('height', '15px')
        .on('click', function (d) {
            self.triggerReportingEvent(d, reportingTrigger, unreportingTrigger);
        });

};

D3Bracket.prototype.getTextToDraw = function (playerData, playerScore) {
    if(!playerData){
        return ' -  TBD';
    } else if (!playerScore){
        return ' -  '+playerData.name;
    } else {
        return playerScore+'  '+playerData.name;
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

D3Bracket.prototype.getFontWeightForPlayerName = function (matchCompleted, playerScore, opponentScore) {
    if (matchCompleted) {
        if (playerScore > opponentScore) {
            return '900';
        }
    }
    return '';
};

function appendTextToNode(node, textVAlign){
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
        .style('fill-opacity', 1);
}

D3Bracket.prototype.drawFirstPlayerNameInNode = function (nodes) {
    var that = this;
    var appendedText = appendTextToNode(nodes, TEXT_IN_NODE_VALIGN_TOP, that);
    appendedText
        .text(function (d) {
            return that.getTextToDraw(d.player1, d.score1);
        })
        .style('font-weight', function (d) {
            return that.getFontWeightForPlayerName(d.complete, d.score1, d.score2);
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

D3Bracket.prototype.drawSecondPlayerNameInNode = function (nodes) {
    var that = this;
    var appendedText = appendTextToNode(nodes, TEXT_IN_NODE_VALIGN_BOTTOM, that);
    appendedText
        .text(function (d) {
            return that.getTextToDraw(d.player2, d.score2);
        })
        .style('font-weight', function (d) {
            return that.getFontWeightForPlayerName(d.complete, d.score2, d.score1);
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

D3Bracket.prototype.drawLinesBetweenNodes = function (svg, links) {
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
        .interpolate('linerar');
    link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function (d) {
            var lineDots = self.getLineDots(d);
            return lineFunction(lineDots);
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
    var numPlayers = _.keys(bracket).length;
    var depth = Math.log(numPlayers + 1) / Math.log(2);
    //debugger;
    this.WIDTH = 400 * Math.round(depth);
    if (numPlayers < 32) {
        this.HEIGHT = this.WIDTH / 2;
    } else if (numPlayers < 127) {
        this.HEIGHT = this.WIDTH * Math.round(depth / 2);
    } else {
        this.HEIGHT = this.WIDTH * Math.ceil(depth);
    }
};
D3Bracket.prototype.drawBracket = function (data, d3, controllerReference) {
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
    this.drawSingleNode(node, this.drawLine(d3), function (d) {
        controllerReference.report(d);
    }, function (d) {
        controllerReference.unreport(d);
    }, data.userPrivileges);
    this.drawFirstPlayerNameInNode(node);
    this.drawSecondPlayerNameInNode(node);
    this.drawLinesBetweenNodes(svg, links);
};

module.exports.D3Bracket = D3Bracket;