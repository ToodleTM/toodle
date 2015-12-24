'use strict';
var e2eUtils = require('./e2eUtils.js');
var path = require('path');

describe('Embedding tournament info in another page', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    it('should not show edit or delete buttons, even if regular users can do so with the "play" page (singleElim)', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('relatedPages')).click();
        element(by.id('embedPageLink')).click();

        e2eUtils.testIntoPopup(function(finished){
            expect(element(by.id('matchNumber-1')).getAttribute('href')).toEqual('');
            finished();
        });
    });

    it('should not show edit or delete buttons, even if regular users can do so with the "play" page (simpleGSL)', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var absolutePath = path.resolve(__dirname, './importPlayers8.csv');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);

        element(by.id('engine')).sendKeys('Simple GSL');
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('relatedPages')).click();
        element(by.id('embedPageLink')).click();

        e2eUtils.testIntoPopup(function (finished) {
            expect(element(by.id('matchNumber-1-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-2-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-3-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-4-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-5-img')).isPresent()).toEqual(false);

            expect(element(by.id('matchNumber-6-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-7-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-8-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-9-img')).isPresent()).toEqual(false);
            expect(element(by.id('matchNumber-10-img')).isPresent()).toEqual(false);

            finished();
        });
    });
});