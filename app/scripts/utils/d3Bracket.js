'use strict';
var D3Bracket = function(){};
var _ = require('../../../node_modules/lodash/lodash.js');

D3Bracket.prototype.convertBracketToD3Tree = function(bracket){
    var transformedBracket = {};

    var root = _.find(bracket, function(item){
        return item.next == null;
    });
    if(root){
       transformedBracket = insertNodes(root, bracket);
    }
    return transformedBracket;
};

function insertNodes(currentNode, bracket){
    var children = _.filter(bracket, function(item){
        return currentNode.number == item.next;
    });
    var result = {};
    result.player1 = currentNode.player1;
    result.player2 = currentNode.player2;
    result.name = currentNode.number;
    result.parent = currentNode.next || 'null';

    if(children.length){
        result.children = [];
        _.forEach(children, function(child){
            result.children.push(insertNodes(child, bracket));
        });
    }
    return result;
};

D3Bracket.prototype.drawBracket = function(bracket){
    var d3Nodes = this.convertBracketToD3Tree(bracket);
    // ************** Generate the tree diagram  *****************
    var margin = {top: 20, right: 1000, bottom: 20, left: 1000},
// width = 960 - margin.right - margin.left,
// height = 500 - margin.top - margin.bottom;
        width = 2000,
        height=1000;
    var i = 0;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var root = d3Nodes;
    update(root);

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = -d.depth * 300; });

        // Declare the nodes¦
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter the nodes.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.y+ "," + d.x + ")"; });

        var lineFunction = d3.svg.line().
            x(function(d){
                //console.log(d);
                return d.x
            }).
            y(function(d){
                //console.log(d);
                return d.y
            }).
            interpolate('linerar');

        var lineData = [{x:-0, y:-20}, {x:100, y:-20}, {x:100, y:20}, {x:0, y:20}, {x:0, y:-20}];
        nodeEnter.append("path")
            .attr("d", lineFunction(lineData))
            .attr("stroke", 'blue')
            .attr('stroke-width', 2)
            .attr('fill', '#fff');

        nodeEnter.append("path")
            .attr("d", lineFunction([{x:0,y:0}, {x:100, y:0}]))
            .attr("stroke", 'black')
            .attr('stroke-width', 1);


        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.parent == "null" ? 30 : 30;
            })
            .attr("y", function(d){return -5})
            //.attr("dy", ".35em")
            .attr("text-anchor", function(d) {
                return "start"; })
            .text(function(d) { return d.player1 ? d.player1.name : "TBD"; })
            .style("fill-opacity", 1);

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.parent == "null" ? 30 : 30; })
            .attr("y", function(d){return 15})
            //.attr("dy", ".35em")
            .attr("text-anchor", function(d) { return "start" })
            .text(function(d) { return d.player2 ? d.player2.name : "TBD"; })
            .style("fill-opacity", 1);



        // Declare the links¦
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        // Enter the links.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", diagonal);

    }
};

module.exports.D3Bracket = D3Bracket;