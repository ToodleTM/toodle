'use strict';
var homeAddress = 'http://localhost';
var e2eUtils = require('./e2eUtils.js');

describe('User having the registration URL', function () {
    beforeEach(function(){
        browser.driver.get(homeAddress);
        browser.waitForAngular();
    });

    it('should not allow tournament to start if no players are registered', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();
        expect(element(by.id('alertMessage')).getText()).toEqual('Something went wrong updating this tournament.');
        expect(element(by.id('alertDetails')).getText()).toEqual('No players registered, there\'s no point in initiating the bracket');
    });

    it('should not allow the user to register a player w/ the same nick twice', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('inputNick')).sendKeys('nick');
        element(by.id('registerPlayerGo')).click();

        element(by.id('inputNick')).sendKeys('nick');
        element(by.id('registerPlayerGo')).click();

        expect(element(by.id('alertMessage')).getText()).toEqual('Player registration failed');
        expect(element(by.id('alertDetails')).getText()).toEqual('A player with that name is already registered');
    });

    it('should not allow empty nicks', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('inputNick')).sendKeys('   ');
        element(by.id('registerPlayerGo')).click();


        expect(element(by.id('alertMessage')).getText()).toEqual('Player registration failed');
        expect(element(by.id('alertDetails')).getText()).toEqual('Empty nicks are not allowed');
    });

    it('should be able to register new players from the admin page', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();
        element(by.id('playerManagement')).click();

        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();

        expect(playersList.getText()).toEqual('Registered players (Total : 2)\nplayer 1\nplayer 2');
    });

    it('should allow normal players to register if tournament has not started', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('runTournament')).click();
        element(by.id('doConfigure')).click();

        element(by.id('playerSignupPageLink')).click();
        e2eUtils.testIntoPopup(function(finished){
            element(by.id('displaySettings')).click();
            element(by.id('playerManagement')).click();

            element(by.id('inputNick')).sendKeys('player 2');
            element(by.id('registerPlayerGo')).click();

            expect(playersList.getText()).toEqual('Registered players (Total : 2)\nplayer 1\nplayer 2');
            finished();
        });
    });

    it('should not allow admin to add players to a started tournament', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();
        element(by.id('playerManagement')).click();

        expect(element(by.id('inputNick')).isDisplayed()).toEqual(false);
    });

    it('should not allow users to add players to a started tournament', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('playerSignupPageLink')).click();
        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('displaySettings')).click();
            element(by.id('playerManagement')).click();

            expect(element(by.id('inputNick')).isDisplayed()).toEqual(false);
            finished();
        });
    });

    it('should be able to select an alternate engine upon players registration before starting', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 3');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 4');
        element(by.id('registerPlayerGo')).click();

        element(by.name('engine')).sendKeys('Simple GSL');

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();

        expect(element(by.name('engine')).getAttribute('value')).toEqual('simpleGSLGroups');
    });

    it('should be able to upload a file to import a players list', function(){
        var path = require('path');
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        var absolutePath = path.resolve(__dirname, './importPlayers4.csv');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);


        expect(element(by.id('playersList')).getText()).toEqual('Registered players (Total : 4)\nplayer 1\nplayer 2\nplayer 3\nplayer 4');
    });

    it('should get an error if user uploads an invalid file', function () {
        var path = require('path');
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        var playersList = element(by.id('playersList'));
        expect(playersList.getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');

        var absolutePath = path.resolve(__dirname, './protractor.conf.js');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);


        expect(element(by.id('playersList')).getText()).toEqual('Registered players (Total : 0)\nNo registered players at the moment');
        expect(element(by.id('alertMessage')).getText()).toEqual('Player registration failed');
        expect(element(by.id('alertDetails')).getText()).toEqual('No Column for player nicks in this file. Remember that the 1st line of your CSV should define the columns. A valid 1st line here is : \'name, faction\'');
    });

    it('should be able to access preconfiguration options when using singleElim tournament engine', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        element(by.id('extraStartOptions')).click();
        expect(element(by.id('extraStartOptionsMenu')).getText()).toEqual('Start w/ default parameters\nLet me configure players');
    });

    it('should show an option to go to the configuration page without actually starting the bracket', function(){
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doConfigure')).click();

        expect(element(by.id('runTournament')).getText()).toEqual('Start brackets');
    });
});