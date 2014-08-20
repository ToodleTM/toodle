//comment out the seleniumAddress attribute if 'non phantom' E2E tests are needed
//in order to do that, webdriver must have been installed and updated as described there :
//https://github.com/angular/protractor/blob/master/docs/tutorial.md
// => all the webdriver-manager config
exports.config = {
    seleniumAddress: 'http://localhost:4300',
    specs: ['createTournament.js', 'playerRegistration.js', 'updateTournament.js', 'startAndStopTournament.js'],
    capabilities:{
        'browserName':'firefox'
    }
};