'use strict';
describe('Tournament reporting general mechanincs', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    it('should display the download link if there is a forfeit in the last match', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('matchNumber-1')).click();
        element(by.id('forfeit-1')).click();
        element(by.id('doReport')).click();

        expect(element(by.id('downloadWinnersLink')).isDisplayed()).toBe(true);
    });

    it('should display the download link if there last match finishes', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('matchNumber-1')).click();
        element(by.id('score1')).clear();
        element(by.id('score1')).sendKeys('1');
        element(by.id('score2')).clear();
        element(by.id('score2')).sendKeys('2');
        element(by.id('closeMatch')).click();
        element(by.id('doReport')).click();

        expect(element(by.id('downloadWinnersLink')).isDisplayed()).toBe(true);
    });

    it('should hide the dowload link if last match is unreported', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('matchNumber-1')).click();
        element(by.id('score1')).clear();
        element(by.id('score1')).sendKeys('1');
        element(by.id('score2')).clear();
        element(by.id('score2')).sendKeys('2');
        element(by.id('closeMatch')).click();
        element(by.id('doReport')).click();

        expect(element(by.id('downloadWinnersLink')).isDisplayed()).toBe(true);
        element(by.id('matchNumber-1')).click();
        element(by.id('doUnreport')).click();
        expect(element(by.id('downloadWinnersLink')).isDisplayed()).toBe(false);

    });
});