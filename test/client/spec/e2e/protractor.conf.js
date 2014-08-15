//comment out the seleniumAddress attribute if 'non phantom' E2E tests are needed
exports.config = {
    seleniumAddress: 'http://localhost:4300',
    specs: ['main.js'],
    capabilities:{
        'browserName':'firefox'
    }
};