'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils');
describe('User having the registration URL', function () {
    it('Should be able to visualize all tournament details and to register once with the same nick', function () {
        //setup
        browser.get(homeAddress);
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
});