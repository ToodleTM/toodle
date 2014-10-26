//comment out the seleniumAddress attribute if 'non phantom' E2E tests are needed
//in order to use phantomjs, webdriver must have been installed and updated as described there :
//https://github.com/angular/protractor/blob/master/docs/tutorial.md
// => all the webdriver-manager config
// For the phantomjs driver to be available, you might want to try installing it this way :
// npm install -g phantomjs
exports.config = {
    seleniumAddress: 'http://127.0.0.1:4300/wd/hub',
    specs: ['accessTournament.js', 'createTournament.js', 'playerRegistration.js', 'updateTournament.js', 'startAndStopTournament.js'],
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
