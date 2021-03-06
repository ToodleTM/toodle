'use strict';
var e2eUtils = require('./e2eUtils.js');
describe('Start tournament', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });

    it('Should not allow tournament start if tournament contains no players', function () {
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        var tourneyRunBox = element(by.id('updateKo'));
        expect(tourneyRunBox.getText()).toMatch(/×\nClose\nSomething went wrong updating this tournament. \(No players registered, there's no point in initiating the tournament\)/g);
    });

    it('should correctly update the buttons classes and form state when tournament starts', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

        expect(element(by.id('runTournament')).getText()).toBe('Stop');
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

        expect(element(by.id('runTournament')).getText()).toBe('Start');
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
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        expect(element(by.id('runTournament')).getText()).toBe('Stop');
        expect(element(by.id('runTournament')).getAttribute('class')).toMatch('btn btn-danger ng-scope');

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        expect(element(by.id('runTournament')).getText()).toBe('Start');
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

    it('should display an error if we try to start the tournament right away but the minimum number of players is not met', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();
        var updateKo = element(by.id('updateKo'));
        expect(updateKo.isDisplayed()).toBe(true);
        expect(updateKo.getText()).toContain('Something went wrong updating this tournament. (Not enough players right now, you need to register more players.)');
    });

    it('should correctly display the bracket if tournament has started', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);
        expect(element(by.id('mainBracket')).isDisplayed()).toBe(true);

        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();
        e2eUtils.testIntoPopup(function(finished) {
            expect(element(by.id('mainBracket')).isDisplayed()).toBe(true);
            finished();
        });
    });
});