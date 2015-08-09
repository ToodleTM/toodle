'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils.js');
describe('Start tournament', function () {
    beforeEach(function(){
        browser.get(homeAddress);
    });

    it('Should not allow tournament start if tournament contains no players', function () {
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        element(by.id('runTournament')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'doStart');
        element(by.id('doStart')).click();

        var tourneyRunBox = element(by.id('updateKo'));
        expect(tourneyRunBox.getText()).toMatch(/×\nClose\nSomething went wrong updating this tournament. \(No players registered, there's no point in initiating the bracket\)/g);
    });

    it('should correctly update the buttons classes and form state when tournament starts', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

        expect(element(by.id('runTournament')).getText()).toBe('Stop brackets');
        expect(element(by.id('runTournament')).getAttribute('class')).toMatch('btn btn-danger ng-scope');

        element(by.id('displaySettings')).click();

        expect(element(by.id('engine')).isEnabled()).toBe(false);
        expect(element(by.id('description')).isEnabled()).toBe(false);
        expect(element(by.id('tournamentStart')).isEnabled()).toBe(false);
        expect(element(by.id('reportRights-0')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-1')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-2')).isEnabled()).toBe(true);

        element(by.id('playerManagement')).click();
        expect(element(by.id('inputNick')).isDisplayed()).toBe(false);
        expect(element(by.id('multiSeedInput')).isDisplayed()).toBe(false);
    });

    it('should show enabled form elements if we get to the tournament in configuration mode', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doConfigure')).click();

        expect(element(by.id('runTournament')).getText()).toBe('Start brackets');
        expect(element(by.id('runTournament')).getAttribute('class')).toMatch('btn btn-success');

        element(by.id('displaySettings')).click();

        expect(element(by.id('engine')).isEnabled()).toBe(true);
        expect(element(by.id('description')).isEnabled()).toBe(true);
        expect(element(by.id('tournamentStart')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-0')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-1')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-2')).isEnabled()).toBe(true);

        element(by.id('playerManagement')).click();
        expect(element(by.id('inputNick')).isDisplayed()).toBe(true);
        expect(element(by.id('multiSeedInput')).isDisplayed()).toBe(true);
    });

    it('should enable form elements if tournament is started, then stopped', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        expect(element(by.id('runTournament')).getText()).toBe('Stop brackets');
        expect(element(by.id('runTournament')).getAttribute('class')).toMatch('btn btn-danger ng-scope');

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        expect(element(by.id('runTournament')).getText()).toBe('Start brackets');
        expect(element(by.id('runTournament')).getAttribute('class')).toMatch('btn btn-success');

        element(by.id('displaySettings')).click();

        expect(element(by.id('engine')).isEnabled()).toBe(true);
        expect(element(by.id('description')).isEnabled()).toBe(true);
        expect(element(by.id('tournamentStart')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-0')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-1')).isEnabled()).toBe(true);
        expect(element(by.id('reportRights-2')).isEnabled()).toBe(true);

        element(by.id('playerManagement')).click();
        expect(element(by.id('inputNick')).isDisplayed()).toBe(true);
        expect(element(by.id('multiSeedInput')).isDisplayed()).toBe(true);
    });

    it('should correctly display the bracket if tournament has started', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);
        expect(element(by.id('bracket')).isDisplayed()).toBe(true);
        element(by.id('playerSignupPageLink')).click();
        expect(element(by.id('bracket')).isDisplayed()).toBe(true);
    });
});