'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils');

function createAndStartATournament() {
    e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
    e2eUtils.configureTheTournamentAndStartIt(browser, element, by);
}

function checkTournamentState(element, by, reportVisibleElement, unreportVisibileElement, reportButtonDisplay, unreportButtonDisplay) {
    expect(element(by.id('reportGame')).getText()).toBe(reportVisibleElement);
    expect(element(by.id('unreportGame')).getText()).toBe(unreportVisibileElement);
    expect(element(by.id('reportGameButton')).isDisplayed()).toBe(reportButtonDisplay);
    expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(unreportButtonDisplay);
}

function player1Wins2Nil(element, by) {
    element(by.id('reportGameButton')).click();
    e2eUtils.waitForElementToBeVisible(browser, element, by, 'score1');
    element(by.id('score1')).sendKeys(2);
    element(by.id('score2')).sendKeys(0);
    element(by.id('doReport')).click();
}
beforeEach(function(){
    browser.get(homeAddress);
    browser.get(homeAddress);
});
describe('Admin Page', function () {
    it('should not be able to unreport or unreport if tournament has not started', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        expect(element(by.id('reportGame')).isDisplayed()).toBe(false);
        expect(element(by.id('unreportGame')).isDisplayed()).toBe(false);
    });

    describe('match reporting', function(){
        it('should be able to report a finished game', function () {
            createAndStartATournament();

            checkTournamentState(element, by, 'test1 VS test2', '', true, false);
            player1Wins2Nil(element, by);

            checkTournamentState(element, by, '', 'test1 VS test2', false, true);
        });
        it('should not touch anything if the user hits the cancel button while reporting', function(){
            createAndStartATournament();

            checkTournamentState(element, by, 'test1 VS test2', '', true, false);

            element(by.id('reportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'score1');
            element(by.id('score1')).sendKeys(2);

            element(by.id('cancelReport')).click();

            checkTournamentState(element, by, 'test1 VS test2', '', true, false);
        });

    });

    describe('match unreporting', function(){
        it('should be able to unreport a game', function(){
            createAndStartATournament();

            checkTournamentState(element, by, 'test1 VS test2', '', true, false);

            player1Wins2Nil(element, by);

            checkTournamentState(element, by, '', 'test1 VS test2', false, true);
            element(by.id('unreportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
            element(by.id('doUnreport')).click();

            checkTournamentState(element, by, 'test1 VS test2', '', true, false);
        });

        it('should not do anything if the user hits the cancel button while unreporting', function(){
            createAndStartATournament();

            checkTournamentState(element, by, 'test1 VS test2', '', true, false);

            player1Wins2Nil(element, by);

            checkTournamentState(element, by, '', 'test1 VS test2', false, true);
            element(by.id('unreportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
            element(by.id('cancelUnreport')).click();

            checkTournamentState(element, by, '', 'test1 VS test2', false, true);
        });
    });
});

describe('User', function () {
    it('should not be able to unreport or unreport if tournament has not started', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'signupLink');

        expect(element(by.id('reportGame')).isDisplayed()).toBe(false);
        expect(element(by.id('unreportGame')).isDisplayed()).toBe(false);
    });

    describe('players can report and unreport', function () {
        describe('match reporting', function () {
            it('should be able to report a finished game', function () {
                createAndStartATournament();
                element(by.id('playerSignupPageLink')).click();

                checkTournamentState(element, by, 'test1 VS test2', '', true, false);
                player1Wins2Nil(element, by);
                checkTournamentState(element, by, '', 'test1 VS test2', false, true);
            });

            it('should not touch anything if the user hits the cancel button while reporting', function () {
                createAndStartATournament();
                element(by.id('playerSignupPageLink')).click();

                checkTournamentState(element, by, 'test1 VS test2', '', true, false);
                element(by.id('reportGameButton')).click();
                e2eUtils.waitForElementToBeVisible(browser, element, by, 'score1');
                element(by.id('cancelReport')).click();

                checkTournamentState(element, by, 'test1 VS test2', '', true, false);
            });

        });
        describe('match unreporting', function () {
            it('should be able to unreport a game', function () {
                createAndStartATournament();
                element(by.id('playerSignupPageLink')).click();

                checkTournamentState(element, by, 'test1 VS test2', '', true, false);
                player1Wins2Nil(element, by);

                checkTournamentState(element, by, '', 'test1 VS test2', false, true);
                element(by.id('unreportGameButton')).click();
                e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
                element(by.id('doUnreport')).click();

                checkTournamentState(element, by, 'test1 VS test2', '', true, false);
            });

            it('should not do anything if the user hits the cancel button while unreporting', function () {
                createAndStartATournament();
                element(by.id('playerSignupPageLink')).click();

                checkTournamentState(element, by, 'test1 VS test2', '', true, false);
                player1Wins2Nil(element, by);

                checkTournamentState(element, by, '', 'test1 VS test2', false, true);
                element(by.id('unreportGameButton')).click();
                e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
                element(by.id('cancelUnreport')).click();

                checkTournamentState(element, by, '', 'test1 VS test2', false, true);
            });
        });
    });

    describe('players have restricted rights', function(){
       it('should not show the unreport section if admin forbids it', function(){
           createAndStartATournament();
           element(by.id('reportRights-1')).click();
           element(by.id('modifyTournament')).click();
           element(by.id('playerSignupPageLink')).click();

           expect(element(by.id('reportGame')).isDisplayed()).toBe(true);
           expect(element(by.id('unreportGame')).isDisplayed()).toBe(false);
           expect(element(by.id('reportGameButton')).isDisplayed()).toBe(true);
           expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(false);
       });

        it('should not show any reporting sections if admin forbids it', function(){
            createAndStartATournament();
            element(by.id('reportRights-2')).click();
            element(by.id('modifyTournament')).click();
            element(by.id('playerSignupPageLink')).click();

            expect(element(by.id('reportGame')).isDisplayed()).toBe(false);
            expect(element(by.id('unreportGame')).isDisplayed()).toBe(false);
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(false);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(false);
        });
    });
});