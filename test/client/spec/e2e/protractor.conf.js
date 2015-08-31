exports.config = {
    specs: ['*E2ESpec.js', 'd3Bracket/*E2ESpec.js', 'simpleGSLGroups/*E2ESpec.js'],
    capabilities:{
        'browserName':'firefox',
        'shardTestFiles':true,
        'maxInstances':1
    },
    seleniumArgs: ['-browserTimeout=60'],
    jasmineNodeOpts: {
        isVerbose: true,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 60000
    }
};

