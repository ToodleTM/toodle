'use strict';
var assert = require('chai').assert;
var E2eUtils = function(){};

function checkBaseFormElementValues(element, by, gameValue, descriptionValue, engineValue, registeredPlayersValue){
    var game = element(by.id('game'));
    var description = element(by.id('description'));
    var engine = element(by.id('engine'));
    var playersList = element(by.id('playersList'));
    expect(game.getAttribute('value')).toEqual(gameValue);
    expect(description.getAttribute('value')).toEqual(descriptionValue);
    expect(engine.getAttribute('value')).toEqual(engineValue);
    expect(playersList.getText()).toEqual(registeredPlayersValue);
}

function checkBaseFormElementState(element, by, pageLinkId){
    var game = element(by.id('game'));
    var description = element(by.id('description'));
    var engine = element(by.id('engine'));

    var shouldBeEnabled = pageLinkId === 'adminLink';
    expect(game.isEnabled()).toBe(shouldBeEnabled);
    expect(description.isEnabled()).toBe(shouldBeEnabled);
    expect(engine.isEnabled()).toBe(shouldBeEnabled);
}

E2eUtils.prototype.waitForElementToBeVisible = function(browser, element, by, elementId){
    browser.wait(function(){
        return element(by.id(elementId)).isDisplayed();
    });
};

E2eUtils.prototype.createTournamentAndGoToPage = function(browser, element, by, pageLinkId){
    element(by.id('tournamentName')).sendKeys('protractor');
    element(by.id('registerTournamentButton')).click();

    var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
    expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g);
    element(by.id(pageLinkId)).click();
    checkBaseFormElementValues(element, by, '', '', '', 'Registered players (0)\nNo registered players at the moment');
    checkBaseFormElementState(element, by, pageLinkId);
    if(pageLinkId === 'adminLink'){
        expect(element(by.id('playerSignupPageLink')).getText()).toBe('Player\'s signup form');
    }
};

E2eUtils.prototype.checkThatSignupPageContentsAreLockedAndEmpty = function(element, by){
    checkBaseFormElementValues(element, by, '', '', '', 'Registered players (0)\nNo registered players at the moment');
    checkBaseFormElementState(element, by, true);
};


E2eUtils.prototype.configureTheTournamentAndStartIt = function(browser, element, by){
    element(by.id('inputNick')).sendKeys('test1');
    element(by.id('registerPlayerGo')).click();

    var engine = element(by.id('engine'));
    engine.sendKeys("Single elim. bracket");
    element(by.id('modifyTournament')).click();

    element(by.id('runTournament')).click();
    this.waitForElementToBeVisible(browser, element, by, 'doStart');
    element(by.id('doStart')).click();
};


module.exports = new E2eUtils();