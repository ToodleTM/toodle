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
        element(by.id('engine')).sendKeys('Simple GSL');
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();
    }


    describe('In ADMIN section', function () {
        it('should be able to forfeit a match that is not yet complete', function () {
            setupTournamentWith4Players();
            var match1 = element(by.id('matchNumber-1'));
            var buttonIcon = element(by.id('matchNumber-1-img'));
            expect(buttonIcon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
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
            buttonIcon = element(by.id('matchNumber-1-img'));
            expect(buttonIcon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[1]')).getAttribute('class')).toEqual('player1 match-winner match-forfeiter');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[2]')).getAttribute('class')).toEqual('score1 match-winner match-forfeiter');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[3]')).getAttribute('class')).toEqual('score2 match-winner');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[4]')).getAttribute('class')).toEqual('player2 match-winner');
        });

        it('should be able to unreport a forfeit', function () {
            setupTournamentWith4Players();
            var match1 = element(by.id('matchNumber-1'));
            var buttonIcon = element(by.id('matchNumber-1-img'));
            expect(buttonIcon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
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
            buttonIcon = element(by.id('matchNumber-1-img'));
            expect(buttonIcon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[1]')).getAttribute('class')).toEqual('player1 match-winner match-forfeiter');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[2]')).getAttribute('class')).toEqual('score1 match-winner match-forfeiter');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[3]')).getAttribute('class')).toEqual('score2 match-winner');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[4]')).getAttribute('class')).toEqual('player2 match-winner');

            match1.click();
            element(by.id('doUnreport')).click();

            expect(buttonIcon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[1]')).getAttribute('class')).toEqual('player1');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[2]')).getAttribute('class')).toEqual('score1');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[3]')).getAttribute('class')).toEqual('score2');
            expect(element(by.xpath('//table[@id="group-1"]//table[@class="group-matches"]//tr[1]/td[4]')).getAttribute('class')).toEqual('player2');
        });
    });

});
