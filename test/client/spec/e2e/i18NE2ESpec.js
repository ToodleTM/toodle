'use strict';
var homeAddress = 'http://localhost';
describe('Admin', function () {
    beforeEach(function () {
        browser.driver.get(homeAddress);
        browser.waitForAngular();
    });
    it('should switch the language to french if user selects french in the top menu', function(){
        element(by.id('activeLanguage')).click();

        element(by.id('language-fr')).click();
        var tourneyConfirmationBox = element(by.id('registerLabel'));
        expect(tourneyConfirmationBox.getText()).toMatch(/Créez un nouveau tournoi!/g);
        element(by.id('activeLanguage')).click();
        element(by.id('language-en')).click();
        expect(tourneyConfirmationBox.getText()).toMatch(/Register a new tournament!/g);
    });
});