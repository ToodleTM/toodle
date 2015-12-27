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

    describe('in ADMIN section', function(){
        it('should switch from 1 player to another when forfeiting if user clicks on player1\'s button, then on player2\'s', function () {
            setupTournamentWith2Players();
            var match1 = element(by.id('matchNumber-1'));
            expect(match1.getAttribute('href')).toEqual('/images/edit.png');
            match1.click();

            element(by.id('score1')).sendKeys('');
            element(by.id('score1')).sendKeys(2);

            element(by.id('score2')).sendKeys('');
            element(by.id('score2')).sendKeys(0);

            element(by.id('forfeit-1')).click();

            expect(element(by.id('closeMatch')).isDisplayed()).toEqual(false);

            expect(element(by.id('score1')).isEnabled()).toEqual(false);
            expect(element(by.id('score2')).isEnabled()).toEqual(false);
            expect(element(by.xpath('//input[@id="score1"]/../..')).getAttribute('class')).toContain('forfeitPlayer');
            expect(element(by.xpath('//input[@id="score2"]/../..')).getAttribute('class')).toEqual('form-group col-sm-6');
            element(by.id('forfeit-2')).click();
            expect(element(by.xpath('//input[@id="score1"]/../..')).getAttribute('class')).toEqual('form-group col-sm-6');
            expect(element(by.xpath('//input[@id="score2"]/../..')).getAttribute('class')).toContain('forfeitPlayer');
        });
    });

});
