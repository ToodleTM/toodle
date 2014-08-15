'use strict';
var homeAddress = 'http://localhost:9042';
describe('User having the admin link of a tournament', function () {
    it("Should be able to edit all fields", function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g);
        element(by.id('adminLink')).click();
        var game = element(by.model('tournamentInfo.game'));
        var description = element(by.model('tournamentInfo.description'));
        var engine = element(by.model('tournamentInfo.engine'));
        var numberOfPlayers = element(by.model('tournamentInfo.numberOfPlayers'));
        var roundFormat = element(by.model('tournamentInfo.roundFormat'));
        expect(game.getAttribute('value')).toEqual('');
        expect(description.getAttribute('value')).toEqual('');
        expect(engine.getAttribute('value')).toEqual('');
        expect(numberOfPlayers.getAttribute('value')).toEqual('');
        expect(roundFormat.getAttribute('value')).toEqual('');
        game.sendKeys("sc2");
        description.sendKeys("this is a test");
        engine.sendKeys("Single elim. bracket w/");
        numberOfPlayers.sendKeys("16");
        roundFormat.sendKeys("Best of 7");
        element(by.id('modifyTournament')).click();
        //browser.refresh(); // => seems to be broken w/ phantomjs, don't know why right now
        expect(game.getAttribute('value')).toEqual('sc2');
        expect(description.getAttribute('value')).toEqual('this is a test');
        expect(engine.getAttribute('value')).toEqual('2');
        expect(numberOfPlayers.getAttribute('value')).toEqual('16');
        expect(roundFormat.getAttribute('value')).toEqual('7');
    });

    it('Should be able to lock and unlock a tournament', function(){
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g);
        element(by.id('adminLink')).click();
        expect(element(by.id('lockTournament')).getText()).toEqual('Lock registrations');
        element(by.id('lockTournament')).click();
        expect(element(by.id('lockTournament')).getText()).toEqual('Open registrations');
    });
});