exports.config = {
    seleniumAddress: 'http://127.0.0.1:4200',
    specs: ['matchReporting.js', 'accessTournament.js', 'createTournament.js', 'playerRegistration.js', 'updateTournament.js', 'startAndStopTournament.js'],
    capabilities:{
        'browserName':'phantomjs'
    }
};

//alt configuration to use w/ a browser with an actual GUI
// => all the webdriver-manager config
//exports.config = {
//    seleniumAddress: 'http://localhost:4300',
//    specs: ['createTournament.js', 'playerRegistration.js', 'updateTournament.js', 'startAndStopTournament.js'],
//    capabilities:{
//        'browserName':'firefox'
//    }
//};

