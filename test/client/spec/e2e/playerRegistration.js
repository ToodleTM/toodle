'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils');
describe('User having the registration URL', function () {
    beforeEach(function(){
        browser.get(homeAddress);
    });
    it('Should be able to visualize all tournament details and to register once with the same nick', function () {
        //setup
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'signupLink');
        e2eUtils.checkThatSignupPageContentsAreLockedAndEmpty(element, by);
        var nickInput = element(by.id("inputNick"));

        //action / assert
        //1st insert
        nickInput.sendKeys('protractest_newRegistration');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playerList')).getText()).toEqual('protractest_newRegistration');
        expect(element(by.id('registrationOk')).getText()).toEqual('×\nClose\nSuccessfully registered');
        //checking that 2nd registration w/ same nick fails
        nickInput.sendKeys('protractest_newRegistration');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playerList')).getText()).toEqual('protractest_newRegistration');
        expect(element(by.id('registrationKo')).getText()).toEqual('×\nClose\nPlayer registration failed (A player with that name is already registered)');
    });

    it('should be able to register new players from the admin page', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        expect(element(by.id('registerPlayerGo')).getText()).toEqual('Go!');
        element(by.id('inputNick')).sendKeys('test1');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playersList')).getText()).toEqual('Registered players (1)\ntest1');
    });

    it('should be able to register new players even if tournament is locked', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        element(by.id('lockTournament')).click();
        expect(element(by.id('registerPlayerGo')).getText()).toEqual('Go!');
        element(by.id('inputNick')).sendKeys('test1');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playersList')).getText()).toEqual('Registered players (1)\ntest1');
    });

    it('should not be able to register new players if tournament has started (button not visible)', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

        expect(element(by.id('registerPlayerGo')).isDisplayed()).toEqual(false);
        expect(element(by.id('playersList')).getText()).toEqual('Registered players (2)\ntest1\ntest2');
    });

    it('should not allow a user to register if registrations have been locked', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        element(by.id('lockTournament')).click();
        element(by.id('playerSignupPageLink')).click();
        expect(element(by.id('registerPlayerGo')).isDisplayed()).toEqual(false);
    });

    it('should not allow a user to register if tournament has started', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);
        element(by.id('playerSignupPageLink')).click();
        expect(element(by.id('registerPlayerGo')).isDisplayed()).toEqual(false);
    });
});