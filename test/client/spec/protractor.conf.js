// conf.js
exports.config = {
    seleniumAddress: 'http://localhost:4300',
    specs: ['main.js'],
    capabilities:{
        'browserName':'chromium'
    }
}