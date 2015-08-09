exports.config = {
    //seleniumAddress: 'http://127.0.0.1:4200/wd/hub',
    specs: ['*.js', 'd3Bracket/*.js'],
    capabilities:{
        'browserName':'firefox'
    }
};
// excluded file so that CI does not fail e2e tests
// i18N.js <== CI protractor / webdriver / whatever version doesn't seem to be compatible w/ cookies

//alt configuration to use w/ a browser with an actual GUI
// => all the webdriver-manager config
//exports.config = {
//    //seleniumAddress: 'http://localhost:4300',
//    specs: ['bracket.js'],
//    capabilities:{
//        'browserName':'firefox'
//    }
//};

