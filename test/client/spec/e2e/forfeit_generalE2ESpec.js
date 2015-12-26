'use strict';
const e2eUtils = require('./e2eUtils');

describe('Player forfeits while bracket is ongoing', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    function setupTournamentWith2Players() {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();
        //browser.pause();
    }


    describe('In PUBLIC section', function () {
        it('should not be able to forfeit a match', function () {
            setupTournamentWith2Players();

            element(by.id('relatedPages')).click();
            element(by.id('playerSignupPageLink')).click();
            e2eUtils.testIntoPopup(function(done){
                var match1 = element(by.id('matchNumber-1'));
                match1.click();
                element(by.id('forfeit-1')).click();
                element(by.id('doReport')).click();
                expect(element(by.id('tourneyReportingKo')).isDisplayed()).toBe(true);
                expect(element(by.id('tourneyReportingKo')).getText()).toContain('You are not allowed to do that');
                done();
            });

        });
    });

});
