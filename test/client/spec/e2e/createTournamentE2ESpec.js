'use strict';
var homeAddress = 'http://localhost';

beforeEach(function () {
    browser.driver.get(homeAddress);
    browser.waitForAngular();
});

describe('App title', function () {
    it('Should be Toodle', function () {
        expect(browser.getTitle()).toEqual('Toodle');
    });
});

describe('Homepage', function () {
    it('Should show a form w/ one field and a go button', function () {
        expect(element(by.id('registerLabel')).getText(), 'Register a new Tournament!');
    });

    it('Should display an error if the user tries to register a tournament w/ an empty name', function () {
        element(by.id('registerTournamentButton')).click();
        expect(element(by.id('tourneyCreationKo')).getText()).toMatch(/×\nClose\nSomething bad happened, the tournament was not created. Please try again. \(Tournament name must not be blank\)/g);
    });

    it('Sould take the user to the admin page if the tournament has been successfully created', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tournamentName = element(by.id('tournamentName'));
        expect(tournamentName.getText()).toMatch(/protractor/g);
    });

});