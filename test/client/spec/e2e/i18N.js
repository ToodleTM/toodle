'use strict';
var homeAddress = 'http://localhost:9042';
describe('Admin', function () {
    it('should switch the language to french if user selects french in the top menu', function(){
        browser.get(homeAddress);
        element(by.id('activeLanguage')).click();

        element(by.id('language-fr')).click();
        var tourneyConfirmationBox = element(by.id('registerLabel'));
        expect(tourneyConfirmationBox.getText()).toMatch(/Créez un nouveau tournoi!/g);
        element(by.id('activeLanguage')).click();
        element(by.id('language-en')).click();
        expect(tourneyConfirmationBox.getText()).toMatch(/Register a new tournament!/g);
    });
});