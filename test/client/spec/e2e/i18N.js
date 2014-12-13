'use strict';
var homeAddress = 'http://localhost:9042';
describe('Admin', function () {
    beforeEach(function(){
        browser.get(homeAddress);
        var ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
    });
    afterEach(function(){
        browser.get(homeAddress);
        var ptor = protractor.getInstance();
        ptor.manage().deleteAllCookies();
    });
    it('should switch the language to french if user selects french in the top menu', function(){
        browser.get(homeAddress);

        element(by.id('language')).sendKeys('FR');

        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nLe tournoi a été créé! Vous pouvez l'administrer en utilisant ce lien , et vous pouvez envoyer ce lien pour permettre aux participants de d'inscrire./g);
    });
});