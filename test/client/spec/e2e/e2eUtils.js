'use strict';
var E2eUtils = function(){};
var _ = require('lodash');

function checkBaseFormElementValues(element, by, engineValue, registeredPlayersValue){
    var engine = element(by.id('engine'));
    var playersList = element(by.id('playersList'));
    expect(engine.getAttribute('value')).toEqual(engineValue);
    expect(playersList.getText()).toEqual(registeredPlayersValue);
}

function checkBaseFormElementState(element, by, pageLinkId){
    var engine = element(by.id('engine'));

    var shouldBeEnabled = pageLinkId === 'adminLink';
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

    checkBaseFormElementValues(element, by, 'singleElim', 'Registered players (Total : 0)\nNo registered players at the moment');

    element(by.id('runTournament')).click();
    element(by.id('doStart')).click();

    checkBaseFormElementState(element, by, pageLinkId);
};


E2eUtils.prototype.configureTheTournamentAndStartIt = function(browser, element, by, extraPlayers, playersRights){
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
    }

    var engine = element(by.id('engine'));
    engine.sendKeys('Single elim. bracket');

    element(by.id('runTournament')).click();
    this.waitForElementToBeVisible(browser, element, by, 'doStart');
    element(by.id('doStart')).click();
    expect(element(by.id('lockTournament')).isPresent()).toBe(false);
    expect(element.all(by.css('.glyphicon-trash')).first().isDisplayed()).toBe(false);

};


module.exports = new E2eUtils();