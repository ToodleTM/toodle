'use strict';
var path = require('path');


describe('Player forfeits while bracket is ongoing', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    function setupTournamentWith4Players() {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var absolutePath = path.resolve(__dirname, '../importPlayers4.csv');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();
    }


    describe('In ADMIN section', function () {
        it('should be able to forfeit a match that is not yet complete', function () {
            setupTournamentWith4Players();
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

            element(by.id('doReport')).click();
            expect(match1.getAttribute('href')).toEqual('/images/delete.png');
        });

        it('should disable forfeit mode if user clicks twice on the same forfeit button', function () {
            setupTournamentWith4Players();
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
            element(by.id('forfeit-1')).click();
            expect(element(by.id('score1')).isEnabled()).toEqual(true);
            expect(element(by.id('score2')).isEnabled()).toEqual(true);
            expect(element(by.xpath('//input[@id="score1"]/../..')).getAttribute('class')).toEqual('form-group col-sm-6');
            expect(element(by.xpath('//input[@id="score2"]/../..')).getAttribute('class')).toEqual('form-group col-sm-6');
        });
    });

});
