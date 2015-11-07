utils_genericUtils = new (require('./utils.js').Utils)();
utils_lodashForApp = require('../../../node_modules/lodash/index.js');
utils_availableRenderers = {
    'singleElim': new (require('./d3Bracket.js').Renderer)(),
    'simpleGSLGroups': new (require('./simpleGSLGroups').Renderer)()
};