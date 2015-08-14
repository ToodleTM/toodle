exports.config = {
    //seleniumAddress: 'http://127.0.0.1:4200/wd/hub',
    specs: ['*.js', 'd3Bracket/*.js', 'simpleGSLGroups/interactiveReporting.js'],
    capabilities:{
        'browserName':'firefox'
    }
};

