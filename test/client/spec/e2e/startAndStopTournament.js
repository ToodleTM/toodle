'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils.js');
describe('Start tournament', function () {
    beforeEach(function(){
        browser.get(homeAddress);
    });
    //it('Should not allow tournament start if no engine is selected', function () {
    //    e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
    //
    //    element(by.id('inputNick')).sendKeys('test1');
    //    element(by.id('registerPlayerGo')).click();
    //
    //    var engine = element(by.id('engine'));
    //    engine.sendKeys('---');
    //    element(by.id('modifyTournament')).click();
    //    e2eUtils.waitForElementToBeVisible(browser, element, by, 'updateOk');
    //    element(by.id('runTournament')).click();
    //    e2eUtils.waitForElementToBeVisible(browser, element, by, 'doStart');
    //    element(by.id('doStart')).click();
    //
    //    var tourneyRunBox = element(by.id('updateKo'));
    //
    //    expect(tourneyRunBox.getText()).toMatch(/×\nClose\nSomething went wrong updating this tournament. \(No game engine was specified, can't start tournament until it's done\)/g);
    //    expect(element(by.id('runTournament')).getText()).toBe('Start brackets');
    //    expect(element(by.id('runTournament')).getAttribute('class')).toMatch('btn btn-danger');
    //});

    it('Should not allow tournament start if tournament contains no players', function () {
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        element(by.id('runTournament')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'doStart');
        element(by.id('doStart')).click();

        var tourneyRunBox = element(by.id('updateKo'));
        expect(tourneyRunBox.getText()).toMatch(/×\nClose\nSomething went wrong updating this tournament. \(No players registered, there's no point in initiating the bracket\)/g);
    });

    it('should correctly update the buttons classes when tournament starts', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

        var tourneyRunBox = element(by.id('updateOk'));
        expect(tourneyRunBox.getText()).toMatch(/×\nClose\nTournament specs successfully updated/g);
        expect(element(by.id('runTournament')).getText()).toBe('Stop brackets');
        expect(element(by.id('runTournament')).getAttribute('class')).toMatch('btn btn-success');
    });

    it('should correctly display the bracket link if tournament has started', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);
        expect(element(by.id('tournamentBracketLink')).isDisplayed()).toBe(true);
        element(by.id('playerSignupPageLink')).click();
        expect(element(by.id('tournamentBracketLink')).isDisplayed()).toBe(true);
    });
});