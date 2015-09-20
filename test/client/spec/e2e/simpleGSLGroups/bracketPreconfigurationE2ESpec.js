'use strict';
var path = require('path');

describe('Bracket preconfiguration', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    function setupTournamentWith4Players() {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var absolutePath = path.resolve(__dirname, '../importPlayers4.csv');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);
    }

    function setupTournamentWith8Players() {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var absolutePath = path.resolve(__dirname, '../importPlayers8.csv');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);
    }

    it('should highlight a slot the user just clicked on', function () {
        setupTournamentWith4Players();

        element(by.id('engine')).sendKeys('Simple GSL pools');
        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();

        var clickableOverlay = element(by.id('clickable-1-player2'));
        var swapIndicator = element(by.id('slot-1-player2'));
        expect(clickableOverlay.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicator.getAttribute('src')).toContain('swapPlayers.png');
        clickableOverlay.click();
        expect(clickableOverlay.getAttribute('src')).toContain('clicked.png');
        expect(swapIndicator.getAttribute('src')).toContain('selectedPlayer.png');
    });

    it('should reset highlighting if user clicks twice on the same slot', function () {
        setupTournamentWith4Players();

        element(by.id('engine')).sendKeys('Simple GSL pools');
        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();

        var clickableOverlay = element(by.id('clickable-1-player2'));
        var swapIndicator = element(by.id('slot-1-player2'));
        expect(clickableOverlay.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicator.getAttribute('src')).toContain('swapPlayers.png');
        clickableOverlay.click();
        expect(clickableOverlay.getAttribute('src')).toContain('clicked.png');
        expect(swapIndicator.getAttribute('src')).toContain('selectedPlayer.png');

        clickableOverlay.click();
        expect(clickableOverlay.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicator.getAttribute('src')).toContain('swapPlayers.png');
    });

    function goToThePreconfigurationPage() {
        element(by.id('engine')).sendKeys('Simple GSL pools');
        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();
    }

    it('should reset player positions if the user clicks on the "Reset" button', function(){
        setupTournamentWith4Players();
        goToThePreconfigurationPage();
        var clickableOverlayForPlayer1 = element(by.id('clickable-1-player2'));
        var clickableOverlayForPlayer2 = element(by.id('clickable-1-player4'));

        clickableOverlayForPlayer1.click();
        clickableOverlayForPlayer2.click();

        element(by.id('reset')).click();
        expect(element(by.xpath('//table[@id="group-1"]//tr[3]/td[2]/span[2]')).getText()).toContain('player 2');
        expect(element(by.xpath('//table[@id="group-1"]//tr[5]/td[2]/span[2]')).getText()).toContain('player 4');
    });

    it('should take the user to the admin page if he clicks on the "Start" button w/ tournament started', function () {
        setupTournamentWith4Players();
        goToThePreconfigurationPage();
        var clickableOverlayForPlayer1 = element(by.id('clickable-1-player2'));
        var clickableOverlayForPlayer2 = element(by.id('clickable-1-player4'));
        clickableOverlayForPlayer1.click();
        clickableOverlayForPlayer2.click();

        element(by.id('confirmPreconfigure')).click();
        expect(browser.driver.getCurrentUrl()).toMatch(/.*\/admin\/(?!preconfigure).*/);
    });

    it('should properly update when a swap is made in the same group', function(){
        setupTournamentWith4Players();
        goToThePreconfigurationPage();
        var clickableOverlayForPlayer1 = element(by.id('clickable-1-player2'));
        var swapIndicatorForPlayer1 = element(by.id('slot-1-player2'));
        var clickableOverlayForPlayer2 = element(by.id('clickable-1-player4'));
        var swapIndicatorForPlayer2 = element(by.id('slot-1-player4'));
        expect(clickableOverlayForPlayer1.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer1.getAttribute('src')).toContain('swapPlayers.png');
        expect(clickableOverlayForPlayer2.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer2.getAttribute('src')).toContain('swapPlayers.png');
        expect(element(by.xpath('//table[@id="group-1"]//tr[3]/td[2]/span[2]')).getText()).toContain('player 2');
        expect(element(by.xpath('//table[@id="group-1"]//tr[5]/td[2]/span[2]')).getText()).toContain('player 4');

        clickableOverlayForPlayer1.click();
        clickableOverlayForPlayer2.click();

        expect(clickableOverlayForPlayer1.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer1.getAttribute('src')).toContain('swapPlayers.png');
        expect(clickableOverlayForPlayer2.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer2.getAttribute('src')).toContain('swapPlayers.png');
        expect(element(by.xpath('//table[@id="group-1"]//tr[3]/td[2]/span[2]')).getText()).toContain('player 4');
        expect(element(by.xpath('//table[@id="group-1"]//tr[5]/td[2]/span[2]')).getText()).toContain('player 2');
    });

    it('should properly update when a swap is made between 2 groups', function(){
        setupTournamentWith8Players();
        goToThePreconfigurationPage();
        var clickableOverlayForPlayer1 = element(by.id('clickable-1-player2'));
        var swapIndicatorForPlayer1 = element(by.id('slot-1-player2'));
        var clickableOverlayForPlayer2 = element(by.id('clickable-2-player8'));
        var swapIndicatorForPlayer2 = element(by.id('slot-2-player8'));
        expect(clickableOverlayForPlayer1.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer1.getAttribute('src')).toContain('swapPlayers.png');
        expect(clickableOverlayForPlayer2.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer2.getAttribute('src')).toContain('swapPlayers.png');
        expect(element(by.xpath('//table[@id="group-1"]//tr[3]/td[2]/span[2]')).getText()).toContain('player 2');
        expect(element(by.xpath('//table[@id="group-2"]//tr[5]/td[2]/span[2]')).getText()).toContain('player 8');
        clickableOverlayForPlayer1.click();
        clickableOverlayForPlayer2.click();

        clickableOverlayForPlayer1 = element(by.id('clickable-2-player2'));
        swapIndicatorForPlayer1 = element(by.id('slot-2-player2'));
        clickableOverlayForPlayer2 = element(by.id('clickable-1-player8'));
        swapIndicatorForPlayer2 = element(by.id('slot-1-player8'));
        expect(clickableOverlayForPlayer1.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer1.getAttribute('src')).toContain('swapPlayers.png');
        expect(clickableOverlayForPlayer2.getAttribute('src')).toContain('clickable.png');
        expect(swapIndicatorForPlayer2.getAttribute('src')).toContain('swapPlayers.png');
        expect(element(by.xpath('//table[@id="group-1"]//tr[3]/td[2]/span[2]')).getText()).toContain('player 8');
        expect(element(by.xpath('//table[@id="group-2"]//tr[5]/td[2]/span[2]')).getText()).toContain('player 2');
    });

    it('should reset selected players if user hits the reset button in the meantime', function () {
        setupTournamentWith8Players();
        goToThePreconfigurationPage();

        expect(element(by.xpath('//table[@id="group-1"]//tr[2]/td[2]/span[2]')).getText()).toContain('player 1');
        var slot1 = element(by.id('clickable-1-player1'));
        slot1.click();
        element(by.id('reset')).click();

        var slot2 = element(by.id('clickable-1-player2'));
        slot2.click();
        expect(element(by.xpath('//table[@id="group-1"]//tr[2]/td[2]/span[2]')).getText()).toContain('player 1');
        expect(element(by.xpath('//table[@id="group-1"]//tr[3]/td[2]/span[2]')).getText()).toContain('player 2');
        expect(slot1.getAttribute('src')).toContain('clickable.png');
        expect(slot2.getAttribute('src')).toContain('clicked.png');
    });
});
