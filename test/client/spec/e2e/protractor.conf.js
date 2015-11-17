exports.config = {
    baseUrl: 'http://localhost:9042',
    specs: [ 'simpleGSLGroups/forfeitE2ESpec.js'],
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

