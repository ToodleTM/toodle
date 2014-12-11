'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils');
describe('User having the admin link of a tournament', function () {
    it("Should be able to edit all fields", function () {
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        var game = element(by.id('game'));
        var description = element(by.id('description'));
        var engine = element(by.id('engine'));
        game.sendKeys("sc2");
        description.sendKeys("this is a test");
        engine.sendKeys("Single elim. bracket w/");
        element(by.id('modifyTournament')).click();
        //browser.refresh(); // => seems to be broken w/ phantomjs, don't know why right now
        expect(game.getAttribute('value')).toEqual('sc2');
        expect(description.getAttribute('value')).toEqual('this is a test');
        expect(engine.getAttribute('value')).toEqual('singleElim');
    });

    it('Should be able to lock and unlock a tournament', function(){
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        expect(element(by.id('lockTournament')).getText()).toEqual('Lock registrations');
        element(by.id('lockTournament')).click();
        expect(element(by.id('lockTournament')).getText()).toEqual('Open registrations');
    });

    it('should not be able to unlock a tournament that has started', function(){
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

        element(by.id('lockTournament')).click();

        expect(element(by.id('tourneyRunKo')).getText()).toMatch(/×\nClose\nSomething went wrong updating this tournament. \(You can't unlock registrations to a running tournament.\)/g);
    });

    it('should be able to register new players from the admin page', function(){
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        expect(element(by.id('registerPlayerGo')).getText()).toEqual('Go!');
        element(by.id('inputNick')).sendKeys('test1');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playersList')).getText()).toEqual('Registered players (1)\ntest1');
    });

    it('should be able to register new players even if tournament is locked', function(){
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        element(by.id('lockTournament')).click();
        expect(element(by.id('registerPlayerGo')).getText()).toEqual('Go!');
        element(by.id('inputNick')).sendKeys('test1');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playersList')).getText()).toEqual('Registered players (1)\ntest1');
    });

    it('should not be able to register new players if tournament has started (button not visible)', function(){
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

        expect(element(by.id('registerPlayerGo')).isDisplayed()).toEqual(false);

        expect(element(by.id('playersList')).getText()).toEqual('Registered players (1)\ntest1');
    });
});