'use strict';
var homeAddress = 'http://localhost:9042';

describe('User having the registration URL', function () {
    it('Should be able to visualize all tournament details and to register once with the same nick', function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g);
        element(by.id('signupLink')).click();
        var game = element(by.model('tournamentInfo.game'));
        var description = element(by.model('tournamentInfo.description'));
        var engine = element(by.model('tournamentInfo.engine'));
        //console.log(element(by.id('playersList')).getTagName());
        var playersList = element(by.id('playersList'));
        expect(game.getAttribute('disabled')).toBeTruthy();
        expect(description.getAttribute('disabled')).toBeTruthy();
        expect(engine.getAttribute('disabled')).toBeTruthy();
        expect(playersList.getText()).toEqual('Registered players (0)\nNo registered players at the moment');
        var nickInput = element(by.id("inputNick"));
        nickInput.sendKeys('protractest_newRegistration');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playerList')).getText()).toEqual('protractest_newRegistration');
        expect(element(by.id('registrationOk')).getText()).toEqual('×\nClose\nSuccessfully registered');
        nickInput.sendKeys('protractest_newRegistration');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playerList')).getText()).toEqual('protractest_newRegistration');
        expect(element(by.id('registrationKo')).getText()).toEqual('×\nClose\nPlayer registration failed (Reason : A player with that name is already registered)');
    });
});