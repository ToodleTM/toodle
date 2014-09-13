'use strict';
var D3Bracket = function () {
};
var _ = require('../../../node_modules/lodash/lodash.js');

D3Bracket.prototype.convertBracketToD3Tree = function (bracket) {
    var transformedBracket = {};

    var root = _.find(bracket, function (item) {
        return item.next == null;
    });
    if (root) {
        transformedBracket = insertNodes(root, bracket);
    }
    return transformedBracket;
};

//recursively runs through the bracket until initial matches are found,
// then places these matches in the "children" array of their upcoming match
// in the tree structure, and so on
function insertNodes(currentNode, bracket) {
    var children = _.filter(bracket, function (item) {
        return currentNode.number == item.next;
    });
    var result = {};
    result.player1 = currentNode.player1;
    result.player2 = currentNode.player2;
    result.name = currentNode.number;
    result.parent = currentNode.next || 'null';

    if (children.length) {
        result.children = [];
        _.forEach(children, function (child) {
            result.children.push(insertNodes(child, bracket));
        });
    }
    return result;
};

var WIDTH = 2000;
var HEIGHT = 1000;
var NODE_TEXT_LEFT_MARGIN = 30;

var NODE_WIDTH = 150;
var NODE_HEIGHT = 40;
var TEXT_IN_NODE_VALIGN_TOP = -5;
var TEXT_IN_NODE_VALIGN_BOTTOM = 15;
var NODE_FILL_COLOR = '#fff';
var NODE_INNER_SEPARATION_COLOR = '#ddd';
var NODE_OUTER_COLOR = '#aad';

var TREE_LEVELS_HORIZONTAL_DEPTH = 400;


function drawSingleNode(nodeEnter, lineFunction) {
    var lineData = [
        {x: 0, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: NODE_HEIGHT / 2},
        {x: 0, y: NODE_HEIGHT / 2},
        {x: 0, y: -NODE_HEIGHT / 2}
    ];
    nodeEnter.append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", NODE_OUTER_COLOR)
        .attr('stroke-width', 2)
        .attr('fill', NODE_FILL_COLOR);

    nodeEnter.append("path")
        .attr("d", lineFunction([
            {x: 0, y: 0},
            {x: NODE_WIDTH, y: 0}
        ]))
        .attr("stroke", NODE_INNER_SEPARATION_COLOR)
        .attr('stroke-width', 1);
}

D3Bracket.prototype.drawPlayerNameInNode = function(node, player1) {
    node.append("text")
        .attr("x", function (d) {
            return  NODE_TEXT_LEFT_MARGIN;
        })
        .attr("y", function (d) {
            return player1 ? TEXT_IN_NODE_VALIGN_TOP : TEXT_IN_NODE_VALIGN_BOTTOM;
        })
        .attr("text-anchor", function (d) {
            return "start";
        })
        .text(function (d) {
            var playerData = player1 ? d.player1 : d.player2
            return playerData ? playerData.name : "TBD";
        })
        .style("fill-opacity", 1);
};

function drawLinesBetweenNodes(svg, links, diagonal) {
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", diagonal);
}
function drawLine() {
    var lineFunction = d3.svg.line().
        x(function (d) {
            return d.x
        }).
        y(function (d) {
            return d.y
        }).
        interpolate('linerar');
    return lineFunction;
}
function tranlateOrigin(node) {
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });
    return nodeEnter;
}
function giveAnIdToEachNode(svg, nodes) {
    var i = 0;
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });
    return node;
}
function appendSvgCanvas(margin) {
    var svg = d3.select("#bracket").append("svg")
        .attr("width", WIDTH + margin.right + margin.left)
        .attr("height", HEIGHT + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    return svg;
}

D3Bracket.prototype.drawBracket = function (bracket) {
    var d3Nodes = this.convertBracketToD3Tree(bracket);


    var tree = d3.layout.tree()
        .size([HEIGHT, WIDTH]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });



    var nodes = tree.nodes(d3Nodes).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = -d.depth * TREE_LEVELS_HORIZONTAL_DEPTH;
        d.x = d.x/2; // vertical alignment should be half the size as the one provided by the init
    });

    var margin = {top: 0, right: 0, bottom: 0, left: HEIGHT};
    var svg = appendSvgCanvas(margin);
    var node = tranlateOrigin(giveAnIdToEachNode(svg, nodes));

    drawSingleNode(node, drawLine());
    this.drawPlayerNameInNode(node, true);
    this.drawPlayerNameInNode(node, false);
    drawLinesBetweenNodes(svg, links, diagonal);
};

module.exports.D3Bracket = D3Bracket;