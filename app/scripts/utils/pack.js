var d3b = new (require('./d3Bracket.js').Renderer)();
var simpleGSLGroups = new (require('./simpleGSLGroups').Renderer)();
var utils = new (require('./utils.js').Utils)();
var lodash = require('../../../node_modules/lodash/index.js');

genericUtils = utils;
binaryBracketRenderer = d3b;
lodashForApp = lodash;
availableRenderers = {
    'singleElim':d3b,
    'simpleGSLGroups':simpleGSLGroups
};