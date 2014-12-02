'use strict';
var homeAddress = 'http://localhost:9042';


describe('Start tournament', function () {
    it('Should not allow tournament start if no engine is selected', function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g);
        element(by.id('adminLink')).click();

        element(by.id('inputNick')).sendKeys('test1');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();


        var tourneyRunBox = element(by.id('tourneyRunKo'));
        expect(tourneyRunBox.getText()).toMatch(/×\nClose\nSomething went wrong updating this tournament. \(No game engine was specified, can't start tournament until it's done\)/g);
        expect(element(by.id("runTournament")).getText()).toBe('Start brackets');
        expect(element(by.id("runTournament")).getAttribute('class')).toMatch('btn btn-danger');
    });

    it('Should not allow tournament start if tournament contains no players', function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g);
        element(by.id('adminLink')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();


        var tourneyRunBox = element(by.id('tourneyRunKo'));
        expect(tourneyRunBox.getText()).toMatch(/×\nClose\nSomething went wrong updating this tournament. \(No players registered, there's no point in initiating the bracket\)/g);
    });

    it('should correctly update the buttons classes when tournament starts', function(){
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g);
        element(by.id('adminLink')).click();

        element(by.id('inputNick')).sendKeys('test1');
        element(by.id('registerPlayerGo')).click();

        var engine = element(by.model('tournamentInfo.engine'));
        engine.sendKeys("Single elim. bracket");
        element(by.id('modifyTournament')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        var tourneyRunBox = element(by.id('tourneyRunOk'));
        expect(tourneyRunBox.getText()).toMatch(/×\nClose\nTournament specs successfully updated/g);
        expect(element(by.id("runTournament")).getText()).toBe('Stop brackets');
        expect(element(by.id("runTournament")).getAttribute('class')).toMatch('btn btn-success');
    });
});