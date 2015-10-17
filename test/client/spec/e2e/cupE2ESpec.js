'use strict';
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
    describe('admin page of a tournament', function () {
        it('should display a button to create a follow-up match if tournament has ended _and_ tournament does not yet have a follow up match', function () {
            createAndStartA2PlayerTournament();
            var followupLink = element(by.id('createFollowupTournamentLink'));

            expect(followupLink.isDisplayed()).toBe(false);
            element(by.id('matchNumber-1')).click();
            element(by.id('forfeit-1')).click();
            element(by.id('doReport')).click();
            expect(followupLink.isDisplayed()).toBe(true);
        });

        it('should not display a button to create a follow-up match if tournament has ended _and_ tournament already has a follow up match, it should display buttons to admin & public pages of the followup tournament instead', function () {
            createAndStartA2PlayerTournament();
            var createFollowupLink = element(by.id('createFollowupTournamentLink'));
            var followupAdminLink = element(by.id('followupAdminLink'));
            var followupPublicLink = element(by.id('followupPublicLink'));

            var parentTournamentURL = '';
            browser.getCurrentUrl().then(function (url) {
                parentTournamentURL = url;
            }).then(function () {
                element(by.id('matchNumber-1')).click();
                element(by.id('forfeit-1')).click();
                element(by.id('doReport')).click();

                createFollowupLink.click();

                element(by.id('tournamentName')).sendKeys('protractor next');
                element(by.id('doConfigure')).click();

                browser.get(parentTournamentURL).then(function () {
                    expect(createFollowupLink.isDisplayed()).toBe(false);
                    element(by.id('relatedLinks')).click();
                    expect(followupAdminLink.isDisplayed()).toBe(true);
                    expect(followupPublicLink.isDisplayed()).toBe(true);
                });
            });
        });
    });

    describe('public page of a tournament', function () {
        // I wonder why this does not work at all ... ended up being quite intricate but simpler implementations failed too
        // Manual testing seems to work, using navigation.back / get does not imply the same error (back seems to effect
        // immediately instead of continuing on to the follow up page and then getting back to the admin age, whereas get seems to allow ...

        //it('should display a link to the public page of its follow-up tournament if such a tournament exists', function () {
        //    createAndStartA2PlayerTournament();
        //    var followupLink = element(by.id('createFollowupTournamentLink'));
        //    var parentTournamentURL = '';
        //    //expect(followupLink.isDisplayed()).toBe(false);
        //    element(by.id('matchNumber-1')).click();
        //    element(by.id('forfeit-1')).click();
        //    element(by.id('doReport')).click();
        //    //expect(followupLink.isDisplayed()).toBe(true);
        //
        //    browser.getCurrentUrl().then(function (url) {
        //        parentTournamentURL = url;
        //        followupLink.click();
        //        element(by.id('tournamentName')).sendKeys('protractor next');
        //        element(by.id('doConfigure')).click().then(function () {
        //            browser.get(parentTournamentURL).then(function () {
        //                element(by.id('playerSignupPageLink')).click();
        //                e2eUtils.testIntoPopup(function (finished) {
        //                    expect(element(by.id('followupPublicLink')).isDisplayed()).toBe(true);
        //                    //ne prend pas followingTournamentPublicId pour ng-show ... je comprends pas
        //                    finished();
        //                });
        //            });
        //        });
        //    });
        //});
    });

});