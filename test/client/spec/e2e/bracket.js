'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils.js');

beforeEach(function(){
    browser.get(homeAddress);
});

function reportAMatchAndAssertBracketStatus(buttonIdToCheckAndClick, expectedFirstNodeIcon, expectedSecondNodeIcon, expectedThirdNodeIcon, expectedFourthNodeIcon){
    e2eUtils.waitForElementToBeVisible(browser, element, by, buttonIdToCheckAndClick);
    element(by.id(buttonIdToCheckAndClick)).click();
    e2eUtils.waitForElementToBeVisible(browser, element, by, 'doReport');
    expect(element(by.id('reportModal')).isDisplayed()).toBe(true);
    element(by.id('score1')).clear();
    element(by.id('score2')).clear();
    element(by.id('score1')).sendKeys('2');
    element(by.id('score2')).sendKeys('1');
    element(by.id('doReport')).click();
    expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe(expectedFirstNodeIcon);
    expect(element(by.id('matchNumber-2')).getAttribute('href')).toBe(expectedSecondNodeIcon);
    expect(element(by.id('matchNumber-5')).getAttribute('href')).toBe(expectedThirdNodeIcon);
    expect(element(by.id('matchNumber-7')).getAttribute('href')).toBe(expectedFourthNodeIcon);
}

function assertFinalStateOfBracket(match1Icon, match2Icon, match3Icon, match4Icon, match5Icon, match6Icon, match7Icon) {
    expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe(match1Icon);
    expect(element(by.id('matchNumber-2')).getAttribute('href')).toBe(match2Icon);
    expect(element(by.id('matchNumber-3')).getAttribute('href')).toBe(match3Icon);
    expect(element(by.id('matchNumber-4')).getAttribute('href')).toBe(match4Icon);
    expect(element(by.id('matchNumber-5')).getAttribute('href')).toBe(match5Icon);
    expect(element(by.id('matchNumber-6')).getAttribute('href')).toBe(match6Icon);
    expect(element(by.id('matchNumber-7')).getAttribute('href')).toBe(match7Icon);
}

describe('Match reporting through the interactive bracket', function () {
    it('should be able to unreport a reported match', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by, ['player3', 'player4', 'player5', 'player6', 'player7', 'player8']);

        e2eUtils.waitForElementToBeVisible(browser, element, by, 'tournamentBracketLink');
        element(by.id('tournamentBracketLink')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'matchNumber-1');
        expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe('/images/circle-green.png');
        element(by.id('matchNumber-1')).click();

        reportAMatchAndAssertBracketStatus('matchNumber-1', '/images/circle-red.png', '/images/circle-green.png', '', '');

        element(by.id('matchNumber-1')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
        element(by.id('doUnreport')).click();

        assertFinalStateOfBracket('/images/circle-green.png', '/images/circle-green.png', '/images/circle-green.png', '/images/circle-green.png', '', '', '');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('');
    });

    it('sould be able to report a match using the interactive bracket', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by, ['player3', 'player4', 'player5', 'player6', 'player7', 'player8']);

        e2eUtils.waitForElementToBeVisible(browser, element, by, 'tournamentBracketLink');
        element(by.id('tournamentBracketLink')).click();

        reportAMatchAndAssertBracketStatus('matchNumber-1', '/images/circle-red.png', '/images/circle-green.png', '', '');
        assertFinalStateOfBracket('/images/circle-red.png', '/images/circle-green.png', '/images/circle-green.png', '/images/circle-green.png', '', '', '');
    });

    it('should not display the unreport button if the next match has already been reported', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by, ['player3', 'player4', 'player5', 'player6', 'player7', 'player8']);

        e2eUtils.waitForElementToBeVisible(browser, element, by, 'tournamentBracketLink');
        element(by.id('tournamentBracketLink')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'matchNumber-1');
        expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe('/images/circle-green.png');

        reportAMatchAndAssertBracketStatus('matchNumber-1', '/images/circle-red.png', '/images/circle-green.png', '', '');

        reportAMatchAndAssertBracketStatus('matchNumber-2', '/images/circle-red.png', '/images/circle-red.png', '/images/circle-green.png', '');

        reportAMatchAndAssertBracketStatus('matchNumber-5', '', '', '/images/circle-red.png', '');

        assertFinalStateOfBracket('', '', '/images/circle-green.png', '/images/circle-green.png', '/images/circle-red.png', '', '');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('');
    });

    it('should not display the reporting dialog if the user does not have any reporting rights and he clicks on the button (which should not be visible)', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by, ['player3', 'player4', 'player5', 'player6', 'player7', 'player8'], 2);

        e2eUtils.waitForElementToBeVisible(browser, element, by, 'tournamentBracketLink');
        element(by.id('tournamentBracketLink')).click();

        expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe('');
        element(by.id('matchNumber-1')).click();
        expect(element(by.id('reportModal')).isDisplayed()).toBe(false);
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('');
    });

    it('should not display the unreporting dialog if user has report-only rights and tries to click on an unreport button (which should not be visible)', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by, ['player3', 'player4', 'player5', 'player6', 'player7', 'player8'], 1);

        e2eUtils.waitForElementToBeVisible(browser, element, by, 'tournamentBracketLink');
        element(by.id('tournamentBracketLink')).click();

        reportAMatchAndAssertBracketStatus('matchNumber-1', '', '/images/circle-green.png', '', '');
        reportAMatchAndAssertBracketStatus('matchNumber-2', '', '', '/images/circle-green.png', '');
        reportAMatchAndAssertBracketStatus('matchNumber-5', '', '', '', '');

        expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe('');
        element(by.id('matchNumber-1')).click();
        expect(element(by.id('reportModal')).isDisplayed()).toBe(false);
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('');
    });
});

describe('Player highlighting', function(){

    function createBracketReportMatches125ClickOnFirstPlayerOnMatch5() {
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by, ['player3', 'player4', 'player5', 'player6', 'player7', 'player8']);
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'tournamentBracketLink');

        element(by.id('tournamentBracketLink')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'matchNumber-1');
        expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe('/images/circle-green.png');
        reportAMatchAndAssertBracketStatus('matchNumber-1', '/images/circle-red.png', '/images/circle-green.png', '', '');

        reportAMatchAndAssertBracketStatus('matchNumber-2', '/images/circle-red.png', '/images/circle-red.png', '/images/circle-green.png', '');
        reportAMatchAndAssertBracketStatus('matchNumber-5', '', '', '/images/circle-red.png', '');
        element(by.id('player1-for-match-5')).click();

        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('Player actually highlighted : test1');
    }
    it('should highlight a player-s run if the user clicks on the players name on the tree', function(){
        createBracketReportMatches125ClickOnFirstPlayerOnMatch5();
    });

    it('should un-highlight a player-s run if the user clicks on the same player name somewhere in the bracket', function(){
        createBracketReportMatches125ClickOnFirstPlayerOnMatch5();
        element(by.id('player1-for-match-1')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('');
    });

    it('should not highlight nodes forward ongoing matches or beyond the point where the player lost', function(){
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        e2eUtils.configureTheTournamentAndStartIt(browser, element, by, ['player3', 'player4', 'player5', 'player6', 'player7', 'player8']);

        e2eUtils.waitForElementToBeVisible(browser, element, by, 'tournamentBracketLink');
        element(by.id('tournamentBracketLink')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'matchNumber-1');
        expect(element(by.id('matchNumber-1')).getAttribute('href')).toBe('/images/circle-green.png');

        reportAMatchAndAssertBracketStatus('matchNumber-1', '/images/circle-red.png', '/images/circle-green.png', '', '');
        reportAMatchAndAssertBracketStatus('matchNumber-2', '/images/circle-red.png', '/images/circle-red.png', '/images/circle-green.png', '');

        element(by.id('player2-for-match-5')).click();
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('Player actually highlighted : player3');
        element(by.id('player1-for-match-2')).click();
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('');
    });

    it('should switch highlighting if user clicks on a different player than the one highlighted', function(){
        createBracketReportMatches125ClickOnFirstPlayerOnMatch5();
        element(by.id('player1-for-match-2')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('Player actually highlighted : player3');
    });

    it('should reset highlighting if the user clicks on a player slot in a match that has not been decided yet', function(){
        createBracketReportMatches125ClickOnFirstPlayerOnMatch5();
        element(by.id('player1-for-match-4')).click();
        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('Player actually highlighted : player7');
    });

    it('should keep active highlighting even if user unreports a match', function(){
        createBracketReportMatches125ClickOnFirstPlayerOnMatch5();
        element(by.id('matchNumber-5')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
        element(by.id('doUnreport')).click();

        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('Player actually highlighted : test1');
    });

    it('should keep active highlighting even if user reports a match', function(){
        createBracketReportMatches125ClickOnFirstPlayerOnMatch5();
        element(by.id('matchNumber-3')).click();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'doReport');
        element(by.id('score1')).clear();
        element(by.id('score2')).clear();
        element(by.id('score1')).sendKeys('2');
        element(by.id('score2')).sendKeys('1');
        element(by.id('doReport')).click();

        expect(element(by.id('linkfrom-5-to-1')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('linkfrom-5-to-2')).getAttribute('class')).toBe('bracket-normalLink');
        expect(element(by.id('linkfrom-7-to-5')).getAttribute('class')).toBe('bracket-highlight');
        expect(element(by.id('highlightedPlayerText')).getText()).toBe('Player actually highlighted : test1');
    });
});
