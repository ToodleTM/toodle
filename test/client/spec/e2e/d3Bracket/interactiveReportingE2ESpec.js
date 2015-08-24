'use strict';
var homeAddress = 'http://localhost';
var e2eUtils = require('./../e2eUtils.js');
var path = require('path');


describe('Match reporting through the interactive bracket', function () {
    beforeEach(function () {
        browser.driver.get(homeAddress);
        browser.waitForAngular();
    });
    function setupTournamentWith4Players() {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var absolutePath = path.resolve(__dirname, '../importPlayers4.csv');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();
    }

    function report2NilForPlayer1(reportingButton) {
        expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
        reportingButton.click();

        element(by.id('score1')).sendKeys('');
        element(by.id('score1')).sendKeys(2);

        element(by.id('score2')).sendKeys('');
        element(by.id('score2')).sendKeys(0);

        element(by.id('closeMatch')).click();

        element(by.id('doReport')).click();
    }

    describe('In ADMIN section', function () {
        it('should be able to report a match if tournament has started', function () {
            setupTournamentWith4Players();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1(match1);

            expect(match1.getAttribute('href')).toEqual('/images/delete.png');
        });
        it('should be able to unreport a match if tournament has started', function () {
            setupTournamentWith4Players();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1(match1);

            match1.click();
            element(by.id('doUnreport')).click();

            expect(match1.getAttribute('href')).toEqual('/images/edit.png');
        });

        it('should be able to report a match even if reporting rights are set to "nothing"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1(match1);

            expect(match1.getAttribute('href')).toEqual('/images/delete.png');
        });

        it('should be able to uneport a match even if reporting rights are set to "only report"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-1')).click();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1(match1);
            expect(match1.getAttribute('href')).toEqual('/images/delete.png');

            match1.click();
            element(by.id('doUnreport')).click();

            expect(match1.getAttribute('href')).toEqual('/images/edit.png');
        });

        it('should be able to uneport a match even if reporting rights are set to "nothing"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1(match1);
            expect(match1.getAttribute('href')).toEqual('/images/delete.png');

            match1.click();
            element(by.id('doUnreport')).click();

            expect(match1.getAttribute('href')).toEqual('/images/edit.png');
        });
        it('should not display the unreport button if the next match has already been reported', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1(match1);
            expect(match1.getAttribute('href')).toEqual('/images/delete.png');
            var match2 = element(by.id('matchNumber-2'));
            report2NilForPlayer1(match2);
            expect(match2.getAttribute('href')).toEqual('/images/delete.png');
            var match3 = element(by.id('matchNumber-3'));
            report2NilForPlayer1(match3);
            expect(match1.getAttribute('href')).toEqual('');
            expect(match2.getAttribute('href')).toEqual('');
            expect(match3.getAttribute('href')).toEqual('/images/delete.png');
        });

        describe('continuous reporting', function () {
            it('should allow to report a partial score (1-1) if user does not check the "final score" box', function () {
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                reportingButton.click();

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(1);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(1);

                element(by.id('doReport')).click();

                expect(element(by.id('player1-for-match-1')).getText()).toContain('1 player 1');
                expect(element(by.id('player2-for-match-1')).getText()).toContain('1 player 2');
                expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
            });


            it('should be able to report a first time and then get the current score when reporting for a second time', function () {
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                reportingButton.click();

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(1);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(1);

                element(by.id('doReport')).click();

                reportingButton.click();

                expect(element(by.id('score1')).getAttribute('value')).toEqual('1');
                expect(element(by.id('score2')).getAttribute('value')).toEqual('1');

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(2);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(1);

                element(by.id('closeMatch')).click();

                element(by.id('doReport')).click();

                expect(element(by.id('player1-for-match-1')).getText()).toContain('2 player 1');
                expect(element(by.id('player2-for-match-1')).getText()).toContain('1 player 2');
                expect(reportingButton.getAttribute('href')).toEqual('/images/delete.png');
            });

            it('should not close a match w/ equal scores even if the close box was checked when score was valid', function () {
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                reportingButton.click();

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(2);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(1);

                element(by.id('closeMatch')).click();

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(2);

                element(by.id('doReport')).click();

                expect(element(by.id('player1-for-match-1')).getText()).toContain('2 player 1');
                expect(element(by.id('player2-for-match-1')).getText()).toContain('2 player 2');
                expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
            });
        });
    });

    describe('In USER section', function () {
        function setup4PlayerTournamentAndGoToPublicPage() {
            setupTournamentWith4Players();
            element(by.id('playerSignupPageLink')).click();
        }

        it('should be able to report a match if tournament has started and reporting rights were left untouched', function () {
            setup4PlayerTournamentAndGoToPublicPage();
            e2eUtils.testIntoPopup(function (finished) {
                var match1 = element(by.id('matchNumber-1'));
                report2NilForPlayer1(match1);

                expect(match1.getAttribute('href')).toEqual('/images/delete.png');
                finished();
            });
        });
        it('should be able to unreport a match if tournament has started and reporting rights were left untouched', function () {
            setup4PlayerTournamentAndGoToPublicPage();

            e2eUtils.testIntoPopup(function (finished) {
                var match1 = element(by.id('matchNumber-1'));
                report2NilForPlayer1(match1);

                match1.click();
                element(by.id('doUnreport')).click();

                expect(match1.getAttribute('href')).toEqual('/images/edit.png');
                finished();
            });
        });

        it('should not be able to unreport a match if reporting rights are set to "only report"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-1')).click();
            element(by.id('playerSignupPageLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                var match1 = element(by.id('matchNumber-1'));
                report2NilForPlayer1(match1);
                expect(match1.getAttribute('href')).toEqual('');
                finished();
            });
        });

        it('should not be able to report (or unreport) a match if reporting rights are set to "nothing"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            element(by.id('playerSignupPageLink')).click();

            e2eUtils.testIntoPopup(function (finished) {
                var match1 = element(by.id('matchNumber-1'));
                expect(match1.getAttribute('href')).toEqual('');
                finished();
            });

        });
        describe('continuous reporting', function () {
            it('should allow to report a partial score (1-1) if user does not check the "final score" box', function () {
                setupTournamentWith4Players();
                element(by.id('playerSignupPageLink')).click();
                e2eUtils.testIntoPopup(function (finished) {
                    var reportingButton = element(by.id('matchNumber-1'));
                    expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                    reportingButton.click();

                    element(by.id('score1')).clear();
                    element(by.id('score1')).sendKeys(1);

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(1);

                    expect(element(by.id('closeMatch')).isDisplayed()).toBe(false);

                    element(by.id('doReport')).click();

                    expect(element(by.id('player1-for-match-1')).getText()).toContain('1 player 1');
                    expect(element(by.id('player2-for-match-1')).getText()).toContain('1 player 2');
                    expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                    finished();
                });
            });


            it('should be able to report a first time and then get the current score when reporting for a second time', function () {
                setupTournamentWith4Players();
                element(by.id('playerSignupPageLink')).click();
                e2eUtils.testIntoPopup(function (finished) {
                    var reportingButton = element(by.id('matchNumber-1'));
                    expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                    reportingButton.click();

                    element(by.id('score1')).clear();
                    element(by.id('score1')).sendKeys(1);

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(1);

                    element(by.id('doReport')).click();

                    reportingButton.click();

                    expect(element(by.id('score1')).getAttribute('value')).toEqual('1');
                    expect(element(by.id('score2')).getAttribute('value')).toEqual('1');

                    element(by.id('score1')).clear();
                    element(by.id('score1')).sendKeys(2);

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(1);

                    element(by.id('closeMatch')).click();

                    element(by.id('doReport')).click();

                    expect(element(by.id('player1-for-match-1')).getText()).toContain('2 player 1');
                    expect(element(by.id('player2-for-match-1')).getText()).toContain('1 player 2');
                    expect(reportingButton.getAttribute('href')).toEqual('/images/delete.png');
                    finished();
                });
            });

            //erreur si score invalide pour une fermeture : report continu
            it('should not close a match w/ equal scores even if the close box was checked when score was valid', function () {
                setupTournamentWith4Players();
                element(by.id('playerSignupPageLink')).click();
                e2eUtils.testIntoPopup(function (finished) {
                    var reportingButton = element(by.id('matchNumber-1'));
                    expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                    reportingButton.click();

                    element(by.id('score1')).clear();
                    element(by.id('score1')).sendKeys(2);

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(1);

                    element(by.id('closeMatch')).click();

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(2);

                    element(by.id('doReport')).click();

                    expect(element(by.id('player1-for-match-1')).getText()).toContain('2 player 1');
                    expect(element(by.id('player2-for-match-1')).getText()).toContain('2 player 2');
                    expect(reportingButton.getAttribute('href')).toEqual('/images/edit.png');
                    finished();
                });
            });
        });
    });
});
