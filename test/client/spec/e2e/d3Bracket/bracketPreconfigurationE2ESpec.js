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

    it('should highlight a slot the user just clicked on', function () {
        setupTournamentWith4Players();

        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();

        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 4');
        var slot1 = element(by.id('clickable-1-1'));
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        slot1.click();
        expect(slot1.getAttribute('href')).toContain('/images/clicked.png');

        var slot2 = element(by.id('clickable-2-2'));
        expect(slot2.getAttribute('href')).toContain('/images/clickable.png');
        slot2.click();
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        expect(slot2.getAttribute('href')).toContain('/images/clickable.png');
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 4');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 1');
    });

    it('should reset highlighting if user clicks twice on the same slot', function () {
        setupTournamentWith4Players();

        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();

        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
        var slot1 = element(by.id('clickable-1-1'));
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        slot1.click();
        expect(slot1.getAttribute('href')).toContain('/images/clicked.png');

        slot1.click();
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
    });

    it('should reset player positions if the user clicks on the "Reset" button', function(){
        setupTournamentWith4Players();

        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();

        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 4');
        var slot1 = element(by.id('clickable-1-1'));
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        slot1.click();
        expect(slot1.getAttribute('href')).toContain('/images/clicked.png');

        var slot2 = element(by.id('clickable-2-2'));
        expect(slot2.getAttribute('href')).toContain('/images/clickable.png');
        slot2.click();
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        expect(slot2.getAttribute('href')).toContain('/images/clickable.png');
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 4');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 1');

        element(by.id('reset')).click();
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 4');
        expect(browser.driver.getCurrentUrl()).toMatch(/.*\/admin\/preconfigure\/.*/);
    });

    it('should take the user to the admin page if he clicks on the "Start" button w/ tournament started', function () {
        setupTournamentWith4Players();

        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();

        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 4');
        var slot1 = element(by.id('clickable-1-1'));
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        slot1.click();
        expect(slot1.getAttribute('href')).toContain('/images/clicked.png');

        var slot2 = element(by.id('clickable-2-2'));
        expect(slot2.getAttribute('href')).toContain('/images/clickable.png');
        slot2.click();
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        expect(slot2.getAttribute('href')).toContain('/images/clickable.png');
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 4');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 1');

        element(by.id('confirmPreconfigure')).click();
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 4');
        expect(element(by.id('player2-for-match-2')).getText()).toEqual('- player 1');
        expect(browser.driver.getCurrentUrl()).toMatch(/.*\/admin\/(?!preconfigure).*/);
    });

    it('should reset selected players if user hits the reset button in the meantime', function(){
        setupTournamentWith4Players();
        element(by.id('extraStartOptions')).click();
        element(by.id('goPreconfigure')).click();
        element(by.id('preconfigure')).click();
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
        var slot1 = element(by.id('clickable-1-1'));
        slot1.click();
        element(by.id('reset')).click();

        var slot2 = element(by.id('clickable-1-2'));
        slot2.click();
        expect(element(by.id('player1-for-match-1')).getText()).toEqual('- player 1');
        expect(element(by.id('player2-for-match-1')).getText()).toEqual('- player 2');
        expect(slot1.getAttribute('href')).toContain('/images/clickable.png');
        expect(slot2.getAttribute('href')).toContain('/images/clicked.png');
    });
});
