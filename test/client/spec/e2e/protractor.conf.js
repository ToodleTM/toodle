exports.config = {
    //seleniumAddress: 'http://127.0.0.1:4200/wd/hub',
    specs: ['*E2ESpec.js', 'd3Bracket/*E2ESpec.js', 'simpleGSLGroups/interactiveReportingE2ESpec.js'],
    capabilities:{
        'browserName':'firefox',
        'shardTestFiles':true,
        'maxInstances':2
    }
};

