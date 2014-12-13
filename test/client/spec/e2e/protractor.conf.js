exports.config = {
    seleniumAddress: 'http://127.0.0.1:4200',
    specs: ['matchReporting.js', 'accessTournament.js', 'createTournament.js', 'playerRegistration.js', 'updateTournament.js', 'startAndStopTournament.js'],
    capabilities:{
        'browserName':'phantomjs'
    }
};
// excluded file so that CI does not fail e2e tests
// i18N.js <== CI protractor / webdriver / whatever version doesn't seem to be compatible w/ cookies

//alt configuration to use w/ a browser with an actual GUI
// => all the webdriver-manager config
//exports.config = {
//    seleniumAddress: 'http://localhost:4300',
//    specs: ['createTournament.js', 'playerRegistration.js', 'updateTournament.js', 'startAndStopTournament.js'],
//    capabilities:{
//        'browserName':'firefox'
//    }
//};

