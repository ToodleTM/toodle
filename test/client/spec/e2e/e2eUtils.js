'use strict';
var E2eUtils = function(){};
var _ = require('lodash');

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

E2eUtils.prototype.waitForElementToBeVisible = function(){
    //browser.wait(function(){
    //    return element(by.id(elementId)).isDisplayed();
    //});
};

E2eUtils.prototype.createTournamentAndGoToPage = function(browser, element, by, pageLinkId){
    element(by.id('tournamentName')).sendKeys('protractor');
    element(by.id('registerTournamentButton')).click();

    checkBaseFormElementValues(element, by, '', '', 'singleElim', 'Registered players (0)\nNo registered players at the moment');

    expect(element(by.id('tournamentBracketLink')).isDisplayed()).toBe(false);
    if(pageLinkId === 'adminLink'){
        expect(element(by.id('playerSignupPageLink')).getText()).toBe('Player\'s signup form');
        element(by.id('playerSignupPageLink')).click();
        expect(element(by.id('tournamentBracketLink')).isDisplayed()).toBe(false);
        browser.navigate().back();
    } else {
        element(by.id('playerSignupPageLink')).click();
    }
    checkBaseFormElementState(element, by, pageLinkId);

};

E2eUtils.prototype.checkThatSignupPageContentsAreLockedAndEmpty = function(element, by){
    checkBaseFormElementValues(element, by, '', '', 'singleElim', 'Registered players (0)\nNo registered players at the moment');
    checkBaseFormElementState(element, by, true);
};


E2eUtils.prototype.configureTheTournamentAndStartIt = function(browser, element, by, extraPlayers, playersRights){
    expect(element(by.id('lockTournament')).isDisplayed()).toBe(true);
    element(by.id('inputNick')).sendKeys('test1');
    element(by.id('registerPlayerGo')).click();
    element(by.id('inputNick')).sendKeys('test2');
    element(by.id('registerPlayerGo')).click();
    _.forEach(extraPlayers, function(player){
        element(by.id('inputNick')).sendKeys(player);
        element(by.id('registerPlayerGo')).click();
    });

    expect(element.all(by.css('.glyphicon-trash')).first().isDisplayed()).toBe(true);
    if(playersRights){
        element(by.id('reportRights-'+playersRights)).click();
        element(by.id('modifyTournament')).click();
    }

    var engine = element(by.id('engine'));
    engine.sendKeys('Single elim. bracket');
    element(by.id('modifyTournament')).click();

    element(by.id('runTournament')).click();
    this.waitForElementToBeVisible(browser, element, by, 'doStart');
    element(by.id('doStart')).click();
    expect(element(by.id('lockTournament')).isPresent()).toBe(false);
    expect(element.all(by.css('.glyphicon-trash')).first().isDisplayed()).toBe(false);

};


module.exports = new E2eUtils();