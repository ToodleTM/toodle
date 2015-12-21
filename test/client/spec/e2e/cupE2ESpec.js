'use strict';
var e2eUtils = require('./e2eUtils');
describe('Embedding tournament info in another page', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    var createAndStartA2PlayerTournament = function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();
    };

    var createAndStartA4PlayerGroupTournament = function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 3');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 4');
        element(by.id('registerPlayerGo')).click();
        element(by.id('engine')).sendKeys('Simple GSL pools');

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();
    };
    describe('admin page of a tournament', function () {
        it('should display a button to create a follow-up match if tournament has ended _and_ it does not yet have a follow up match', function () {
            createAndStartA2PlayerTournament();
            var followupLink = element(by.id('createFollowupTournamentLink'));

            expect(followupLink.isDisplayed()).toBe(false);
            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            expect(followupLink.isDisplayed()).toBe(true);
        });

        it('should not display a button to create a follow-up match if tournament already has a follow up match, it should display buttons to admin & public pages of the followup tournament instead', function () {
            createAndStartA2PlayerTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));

            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            createFollowupLink.click();

            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('doConfigure')).click();

            element(by.id('relatedLinks')).click();
            element(by.id('parentAdminLink')).click();

            e2eUtils.testIntoPopup(function (finished) {
                var createFollowupLink = element(by.id('createFollowupTournamentLink'));
                var followupAdminLink = element(by.id('followupAdminLink'));
                var followupPublicLink = element(by.id('followupPublicLink'));
                expect(createFollowupLink.isDisplayed()).toBe(false);//should not be able create a follow up tournament if one already exists
                var runTournamentButton = element(by.id('runTournament'));
                expect(runTournamentButton.isPresent()).toBe(false);//should not be able to toggle parent tournament "running" state
                element(by.id('relatedLinks')).click();
                expect(followupAdminLink.isDisplayed()).toBe(true);//parent tournament should have a link to the admin page of its son
                expect(followupPublicLink.isDisplayed()).toBe(true);//parent tournament should have a link to the public page of its son
                finished();
            });
        });

        it('should take all parameters in the follow-up creation modal into account while creating the new tournament', function () {
            //setup
            createAndStartA2PlayerTournament();
            //action
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            createFollowupLink.click();

            element(by.id('tournamentNameModal')).clear();
            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('descriptionModal')).clear();
            element(by.id('descriptionModal')).sendKeys('next tournament description');
            element(by.id('tournamentStartModal')).clear();
            element(by.id('tournamentStartModal')).sendKeys('2016-01-25');
            //element(by.id('engineModal')).clear();
            element(by.id('engineModal')).sendKeys('Single elimination bracket');

            element(by.id('doConfigure')).click();
            element(by.id('displaySettings')).click();
            //assert
            expect(element(by.id('engine')).getAttribute('value')).toEqual('singleElim');
            expect(element(by.id('tournamentStart')).getAttribute('value')).toEqual('25-01-2016');
            expect(element(by.id('tournamentName')).getText()).toEqual('protractor next');
            expect(element(by.id('description')).getAttribute('value')).toEqual('next tournament description');
        });

        it('should not be able to report matches if current tournament has a follow-up tournament', function () {
            createAndStartA2PlayerTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            createFollowupLink.click();
            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('doConfigure')).click();
            element(by.id('relatedLinks')).click();
            element(by.id('parentAdminLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                var reportingButton = element(by.xpath('//*[@id="mainBracket"]//*[@id="matchNumber-1"]'));

                expect(reportingButton.getAttribute('href')).toBe('');
                finished();
            });
        });

        it('should show a button if there is a parent tournament available, a click on that button shows the parent\'s bracket. Button disappears if there are no more parent tournaments available', function () {
            createAndStartA2PlayerTournament();
            expect(element(by.xpath('//*[contains(@id, "protractor")]')).isPresent()).toBe(false);
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            createFollowupLink.click();
            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('doConfigure')).click();

            element(by.id('showTournamentParent')).click();
            expect(element(by.xpath('//*[contains(@id, "protractor")]')).isDisplayed()).toBe(true);
            expect(element(by.id('showTournamentParent')).isDisplayed()).toBe(false);
        });

        it('should be able to start the follow up tournament right away if the amount of players is valid', function () {
            createAndStartA4PlayerGroupTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            for (var i = 1; i < 6; i++) {
                element(by.id('matchNumber-' + i)).click();
                element(by.id('forfeit-1')).click();
                element(by.id('doReport')).click();
            }

            createFollowupLink.click();
            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('engineModal')).sendKeys('Single elimination bracket');
            element(by.id('doStart')).click();

            expect(element(by.id('runTournament')).getAttribute('class')).toContain('btn-danger');
            expect(element(by.id('mainBracket')).isPresent()).toBe(true);
            expect(element(by.id('mainBracket')).getText()).toContain('- player 3');
            expect(element(by.id('showTournamentParent')).isDisplayed()).toBe(true);
        });

        it('should be able to start the follow up tournament right away if the amount of players is valid', function () {
            createAndStartA4PlayerGroupTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            for (var i = 1; i < 6; i++) {
                element(by.id('matchNumber-' + i)).click();
                element(by.id('forfeit-1')).click();
                element(by.id('doReport')).click();
            }

            createFollowupLink.click();
            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            //element(by.id('engineModal')).sendKeys('Single elimination bracket');
            element(by.id('doStart')).click();

            expect(element(by.id('infoMessage')).getText()).toContain('Could not start following tournament right away');
            expect(element(by.id('infoMessage')).getText()).toContain('Not enough players right now, you need to register more players.');
            expect(element(by.id('runTournament')).getAttribute('class')).toContain('btn btn-success');
            expect(element(by.id('mainBracket')).isPresent()).toBe(true);
            expect(element(by.id('mainBracket')).getText()).toBe('');
            expect(element(by.id('showTournamentParent')).isDisplayed()).toBe(true);
        });
    });

    describe('public page of a tournament', function () {
        it('should display a link to the public page of its follow-up tournament if such a tournament exists', function () {
            createAndStartA2PlayerTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));

            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            createFollowupLink.click();

            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('doConfigure')).click();

            element(by.id('relatedLinks')).click();
            element(by.id('parentPublicLink')).click();

            e2eUtils.testIntoPopup(function (finished) {
                var followupPublicLink = element(by.id('followupPublicLink'));
                expect(followupPublicLink.isDisplayed()).toBe(true);//parent tournament public page should have a link to the public page of its son
                finished();
            });
        });

        it('should not be able to report matches if current tournament has a follow-up tournament', function(){
            createAndStartA2PlayerTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            createFollowupLink.click();
            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('doConfigure')).click();
            element(by.id('relatedLinks')).click();
            element(by.id('parentPublicLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                var reportingButton = element(by.xpath('//*[@id="mainBracket"]//*[@id="matchNumber-1"]'));

                expect(reportingButton.getAttribute('href')).toBe('');
                finished();
            });
        });

        it('should show a button if there is a parent tournament available, a click on that button shows the parent\'s bracket. Button disappears if there are no more parent tournaments available', function () {
            createAndStartA2PlayerTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            createFollowupLink.click();
            element(by.id('tournamentNameModal')).sendKeys('protractor next');
            element(by.id('doConfigure')).click();

            element(by.id('playerSignupPageLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                element(by.id('showTournamentParent')).click();
                expect(element(by.xpath('//*[contains(@id, "protractor")]')).isDisplayed()).toBe(true);
                expect(element(by.id('showTournamentParent')).isDisplayed()).toBe(false);
                finished();
            });
        });
    });
});