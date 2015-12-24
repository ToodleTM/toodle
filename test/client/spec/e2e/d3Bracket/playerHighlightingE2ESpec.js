'use strict';
var e2eUtils = require('./../e2eUtils.js');
var path = require('path');
beforeEach(function () {
    browser.get('');
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
function setupTournamentWith8Players() {
    element(by.id('tournamentName')).sendKeys('protractor');
    element(by.id('registerTournamentButton')).click();

    var absolutePath = path.resolve(__dirname, '../importPlayers8.csv');
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
function setupPlayerTournamentReport2FirstMatches() {
    setupTournamentWith8Players();
    var match1 = element(by.id('matchNumber-1'));
    report2NilForPlayer1(match1);
    var match2 = element(by.id('matchNumber-2'));
    report2NilForPlayer1(match2);
    var match5 = element(by.id('matchNumber-5'));
    report2NilForPlayer1(match5);
}
describe('Player highlighting - ADMIN page', function () {
    it('should highlight a player-s run if the user clicks on the players name on the tree', function () {
        setupTournamentWith4Players();
        var match1 = element(by.id('matchNumber-1'));
        report2NilForPlayer1(match1);
        element(by.id('clickable-3-1')).click();

        expect(element(by.id('linkfrom-3-to-1')).getAttribute('class')).toEqual('bracket-highlight');
    });
    it('should un-highlight a player-s run if the user clicks on the same player name somewhere in the bracket', function () {
        setupTournamentWith4Players();
        var match1 = element(by.id('matchNumber-1'));
        report2NilForPlayer1(match1);
        element(by.id('clickable-3-1')).click();

        expect(element(by.id('linkfrom-3-to-1')).getAttribute('class')).toEqual('bracket-highlight');
        element(by.id('clickable-1-1')).click();
        expect(element(by.id('linkfrom-3-to-1')).getAttribute('class')).toEqual('bracket-normalLink');
    });
    it('should not highlight nodes forward ongoing matches or beyond the point where the player lost', function () {
        setupTournamentWith8Players();
        var match1 = element(by.id('matchNumber-1'));
        report2NilForPlayer1(match1);
        var match2 = element(by.id('matchNumber-2'));
        report2NilForPlayer1(match2);

        element(by.id('clickable-5-2')).click();
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-normalLink');

        element(by.id('clickable-2-1')).click();
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toEqual('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-normalLink');
    });

    it('should switch highlighting if user clicks on a different player than the one highlighted', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('clickable-5-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-highlight');

        element(by.id('clickable-2-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');

        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-normalLink');
    });


    it('should reset highlighting if the user clicks on a player that has not advanced yet', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('clickable-5-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-highlight');

        element(by.id('clickable-4-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
    });

    it('should keep active highlighting even if user unreports a match', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('clickable-5-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-highlight');

        element(by.id('matchNumber-5')).click();
        element(by.id('doUnreport')).click();

        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
    });

    it('should keep active highlighting even if user reports a match', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('clickable-5-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-highlight');
        element(by.id('matchNumber-3')).click();

        element(by.id('score1')).clear();
        element(by.id('score2')).clear();
        element(by.id('score1')).sendKeys('2');
        element(by.id('score2')).sendKeys('1');
        element(by.id('doReport')).click();

        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-highlight');
    });
});

describe('Player highlighting - PUBLIC page', function () {
    it('should highlight a player-s run if the user clicks on the players name on the tree', function () {
        setupTournamentWith4Players();
        var match1 = element(by.id('matchNumber-1'));
        report2NilForPlayer1(match1);
        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();

        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('clickable-3-1')).click();
            expect(element(by.id('linkfrom-3-to-1')).getAttribute('class')).toEqual('bracket-highlight');
            finished();
        });
    });
    it('should un-highlight a player-s run if the user clicks on the same player name somewhere in the bracket', function () {
        setupTournamentWith4Players();
        var match1 = element(by.id('matchNumber-1'));
        report2NilForPlayer1(match1);
        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();

        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('clickable-3-1')).click();

            expect(element(by.id('linkfrom-3-to-1')).getAttribute('class')).toEqual('bracket-highlight');
            element(by.id('clickable-1-1')).click();
            expect(element(by.id('linkfrom-3-to-1')).getAttribute('class')).toEqual('bracket-normalLink');
            finished();
        });
    });
    it('should not highlight nodes forward ongoing matches or beyond the point where the player lost', function () {
        setupTournamentWith8Players();
        var match1 = element(by.id('matchNumber-1'));
        report2NilForPlayer1(match1);
        var match2 = element(by.id('matchNumber-2'));
        report2NilForPlayer1(match2);

        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();

        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('clickable-5-2')).click();
            expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toEqual('bracket-highlight');
            expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-normalLink');

            element(by.id('clickable-2-1')).click();
            expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toEqual('bracket-normalLink');
            expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-normalLink');
            finished();
        });
    });

    it('should switch highlighting if user clicks on a different player than the one highlighted', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('clickable-5-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-highlight');
        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();

        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('clickable-2-1')).click();
            expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-normalLink');
            expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');

            expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toEqual('bracket-highlight');
            expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-normalLink');
            finished();
        });
    });


    it('should reset highlighting if the user clicks on a player that has not advanced yet', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('clickable-5-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toEqual('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toEqual('bracket-highlight');
        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();

        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('clickable-4-1')).click();
            expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-normalLink');
            expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
            expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
            finished();
        });
    });

    it('should keep active highlighting even if user unreports a match', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();
        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('clickable-5-1')).click();
            element(by.id('matchNumber-5')).click();
            element(by.id('doUnreport')).click();

            expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-highlight');
            expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
            expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
            finished();
        });
    });

    it('should keep active highlighting even if user reports a match', function () {
        setupPlayerTournamentReport2FirstMatches();
        element(by.id('relatedPages')).click();
        element(by.id('playerSignupPageLink')).click();
        e2eUtils.testIntoPopup(function (finished) {
            element(by.id('clickable-5-1')).click();
            element(by.id('matchNumber-3')).click();

            element(by.id('score1')).clear();
            element(by.id('score2')).clear();
            element(by.id('score1')).sendKeys('2');
            element(by.id('score2')).sendKeys('1');
            element(by.id('doReport')).click();

            expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-highlight');
            expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
            expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-highlight');
            finished();
        });
    });
});