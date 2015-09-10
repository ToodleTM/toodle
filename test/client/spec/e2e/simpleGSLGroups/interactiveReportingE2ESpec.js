'use strict';
var e2eUtils = require('./../e2eUtils.js');
var path = require('path');

describe('Match reporting through the interactive bracket', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    function setupTournamentWith4Players() {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var absolutePath = path.resolve(__dirname, '../importPlayers4.csv');
        element(by.id('multiSeedInput')).sendKeys(absolutePath);
        element(by.id('engine')).sendKeys('Simple GSL');
        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();
    }

    function report2NilForPlayer1(buttonId) {
        var match1 = element(by.id(buttonId));
        var buttonIcon = element(by.id(buttonId + '-img'));
        expect(buttonIcon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
        match1.click();

        element(by.id('score1')).sendKeys('');
        element(by.id('score1')).sendKeys(2);

        element(by.id('score2')).sendKeys('');
        element(by.id('score2')).sendKeys(0);

        element(by.id('closeMatch')).click();

        element(by.id('doReport')).click();
    }

    function report2NilForPlayer2(buttonId) {
        var match1 = element(by.id(buttonId));
        var buttonIcon = element(by.id(buttonId + '-img'));
        expect(buttonIcon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
        match1.click();

        element(by.id('score1')).sendKeys('');
        element(by.id('score1')).sendKeys(0);

        element(by.id('score2')).sendKeys('');
        element(by.id('score2')).sendKeys(2);

        element(by.id('closeMatch')).click();

        element(by.id('doReport')).click();
    }

    describe('In ADMIN section', function () {
        it('should be able to report a match if tournament has started', function () {
            setupTournamentWith4Players();

            report2NilForPlayer1('matchNumber-1');

            var icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
        });
        it('should be able to unreport a match if tournament has started', function () {
            setupTournamentWith4Players();
            report2NilForPlayer1('matchNumber-1');
            var match1 = element(by.id('matchNumber-1'));

            match1.click();
            element(by.id('doUnreport')).click();

            var icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
        });
        it('should be able to report a match even if reporting rights are set to "nothing"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            report2NilForPlayer1('matchNumber-1');
            var icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
        });
        it('should be able to uneport a match even if reporting rights are set to "only report"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-1')).click();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1('matchNumber-1');
            var icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');

            match1.click();
            element(by.id('doUnreport')).click();
            icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
        });
        it('should be able to uneport a match even if reporting rights are set to "nothing"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            var match1 = element(by.id('matchNumber-1'));
            report2NilForPlayer1('matchNumber-1');
            var icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');

            match1.click();
            element(by.id('doUnreport')).click();
            icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
        });
        it('should not display the unreport button if the next match has already been reported', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            report2NilForPlayer1('matchNumber-1');
            var icon = element(by.id('matchNumber-1-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
            report2NilForPlayer1('matchNumber-2');
            icon = element(by.id('matchNumber-2-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
            report2NilForPlayer1('matchNumber-3');

            report2NilForPlayer1('matchNumber-4');

            icon = element(by.id('matchNumber-1-img'));
            expect(icon.isPresent()).toBe(false);
            icon = element(by.id('matchNumber-2-img'));
            expect(icon.isPresent()).toBe(false);
            icon = element(by.id('matchNumber-3-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
            icon = element(by.id('matchNumber-4-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');

            report2NilForPlayer1('matchNumber-5');
            icon = element(by.id('matchNumber-3-img'));
            expect(icon.isPresent()).toBe(false);
            icon = element(by.id('matchNumber-4-img'));
            expect(icon.isPresent()).toBe(false);
            icon = element(by.id('matchNumber-5-img'));
            expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
        });

        function checkPlayerRankingsInGroup(slot1Player, slot2Player, slot3Player, slot4Player) {
            expect(element(by.xpath('//table[@id="group-1"]//tr[@class="group-player-line ng-scope"][1]/td[2]')).getText()).toEqual(slot1Player);
            expect(element(by.xpath('//table[@id="group-1"]//tr[@class="group-player-line ng-scope"][2]/td[2]')).getText()).toEqual(slot2Player);
            expect(element(by.xpath('//table[@id="group-1"]//tr[@class="group-player-line ng-scope"][3]/td[2]')).getText()).toEqual(slot3Player);
            expect(element(by.xpath('//table[@id="group-1"]//tr[@class="group-player-line ng-scope"][4]/td[2]')).getText()).toEqual(slot4Player);
        }

        it('should rearrange the players in the top rankings of a group as matches are reported', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            checkPlayerRankingsInGroup('player 1', 'player 2', 'player 3', 'player 4');

            report2NilForPlayer2('matchNumber-1');
            checkPlayerRankingsInGroup('player 4', 'player 2', 'player 3', 'player 1');

            report2NilForPlayer2('matchNumber-2');
            checkPlayerRankingsInGroup('player 3', 'player 4', 'player 1', 'player 2');

            report2NilForPlayer1('matchNumber-3');
            checkPlayerRankingsInGroup('player 4', 'player 3', 'player 1', 'player 2');

            report2NilForPlayer2('matchNumber-4');
            checkPlayerRankingsInGroup('player 4', 'player 2', 'player 3', 'player 1');

            report2NilForPlayer1('matchNumber-5');
            checkPlayerRankingsInGroup('player 4', 'player 3', 'player 2', 'player 1');
        });

        describe('continuous reporting', function () {
            it('should allow to report a partial score (1-1) if user does not check the "final score" box', function () {
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                reportingButton.click();

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(1);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(1);



                element(by.id('doReport')).click();

                expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[2]')).getText()).toEqual('1');
                expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[3]')).getText()).toEqual('1');

                icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
            });

            it('should be able to report a first time and then get the current score when reporting for a second time', function () {
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
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

                expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[2]')).getText()).toEqual('2');
                expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[3]')).getText()).toEqual('1');
                icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
                icon = element(by.id('matchNumber-2-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
            });

            it('should not close a match w/ equal scores even if the close box was checked when score was valid (2-1 then 2-2)', function () {
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                reportingButton.click();

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(2);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(1);

                element(by.id('closeMatch')).click();

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(2);

                element(by.id('doReport')).click();

                expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[2]')).getText()).toEqual('2');
                expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[3]')).getText()).toEqual('2');
                icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                icon = element(by.id('matchNumber-2-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
            });

            it('should not change players background colors on matches if match is not over (1st player has highest score)', function(){
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                reportingButton.click();

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(2);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(1);


                element(by.id('doReport')).click();

                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[1]')).getAttribute('class')).toEqual('player1');
                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[2]')).getAttribute('class')).toEqual('score1');
                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[3]')).getAttribute('class')).toEqual('score2');
                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[4]')).getAttribute('class')).toEqual('player2');
            });

            it('should not change players background colors on matches if match is not over (2nd player has highest score)', function () {
                setupTournamentWith4Players();
                var reportingButton = element(by.id('matchNumber-1'));
                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                reportingButton.click();

                element(by.id('score1')).clear();
                element(by.id('score1')).sendKeys(1);

                element(by.id('score2')).clear();
                element(by.id('score2')).sendKeys(2);


                element(by.id('doReport')).click();

                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[1]')).getAttribute('class')).toEqual('player1');
                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[2]')).getAttribute('class')).toEqual('score1');
                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[3]')).getAttribute('class')).toEqual('score2');
                expect(element(by.xpath('//*[@id="group-1"]/tbody/tr[8]/td/table/tbody/tr[1]/td[4]')).getAttribute('class')).toEqual('player2');
            });
        });
    });
    describe('In USER section', function () {
        it('should be able to report a match if tournament has started and reporting rights were left untouched', function () {
            setupTournamentWith4Players();
            element(by.id('playerSignupPageLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                report2NilForPlayer1('matchNumber-1');

                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
                finished();
            });
        });
        it('should be able to unreport a match if tournament has started and reporting rights were left untouched', function () {
            setupTournamentWith4Players();
            element(by.id('playerSignupPageLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                report2NilForPlayer1('matchNumber-1');
                var match1 = element(by.id('matchNumber-1'));

                match1.click();
                element(by.id('doUnreport')).click();

                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                finished();
            });
        });
        it('should not be able to unreport a match if reporting rights are set to "only report"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-1')).click();
            element(by.id('playerSignupPageLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                report2NilForPlayer1('matchNumber-1');
                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.isPresent()).toBe(false);

                finished();
            });
        });
        it('should not be able to report (or unreport) a match if reporting rights are set to "nothing"', function () {
            setupTournamentWith4Players();
            element(by.id('reportRights-2')).click();
            element(by.id('playerSignupPageLink')).click();
            e2eUtils.testIntoPopup(function (finished) {
                var icon = element(by.id('matchNumber-1-img'));
                expect(icon.isPresent()).toBe(false);

                finished();
            });
        });
        describe('continuous reporting', function () {
            it('should allow to report a partial score (1-1) if user does not check the "final score" box', function () {
                setupTournamentWith4Players();
                element(by.id('playerSignupPageLink')).click();

                e2eUtils.testIntoPopup(function (finished) {
                    var reportingButton = element(by.id('matchNumber-1'));
                    var icon = element(by.id('matchNumber-1-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                    reportingButton.click();

                    element(by.id('score1')).clear();
                    element(by.id('score1')).sendKeys(1);

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(1);

                    expect(element(by.id('closeMatch')).isDisplayed()).toBe(false);

                    element(by.id('doReport')).click();

                    expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[2]')).getText()).toEqual('1');
                    expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[3]')).getText()).toEqual('1');

                    icon = element(by.id('matchNumber-1-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                    finished();
                });
            });
            it('should be able to report a first time and then get the current score when reporting for a second time', function () {
                setupTournamentWith4Players();
                element(by.id('playerSignupPageLink')).click();
                e2eUtils.testIntoPopup(function (finished) {
                    var reportingButton = element(by.id('matchNumber-1'));
                    var icon = element(by.id('matchNumber-1-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
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

                    expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[2]')).getText()).toEqual('2');
                    expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[3]')).getText()).toEqual('1');
                    icon = element(by.id('matchNumber-1-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-trash match-unreport-button');
                    icon = element(by.id('matchNumber-2-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                    finished();
                });
            });
            it('should not close a match w/ equal scores even if the close box was checked when score was valid (2-1 then 2-2)', function () {
                setupTournamentWith4Players();
                element(by.id('playerSignupPageLink')).click();
                e2eUtils.testIntoPopup(function (finished) {
                    var reportingButton = element(by.id('matchNumber-1'));
                    var icon = element(by.id('matchNumber-1-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                    reportingButton.click();

                    element(by.id('score1')).clear();
                    element(by.id('score1')).sendKeys(2);

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(1);

                    element(by.id('closeMatch')).click();

                    element(by.id('score2')).clear();
                    element(by.id('score2')).sendKeys(2);

                    element(by.id('doReport')).click();

                    expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[2]')).getText()).toEqual('2');
                    expect(element(by.xpath('//table[@class="group-matches"]//tr[1]//td[3]')).getText()).toEqual('2');
                    icon = element(by.id('matchNumber-1-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                    icon = element(by.id('matchNumber-2-img'));
                    expect(icon.getAttribute('class')).toContain('glyphicon glyphicon-edit match-report-button');
                    finished();
                });
            });
        });
    });
});
