'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils');
describe('Admin', function () {
    it('should not be able to unreport or unreport if tournament has not started', function(){
        browser.get(homeAddress);

        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        expect(element(by.id('reportGame')).isDisplayed()).toBe(false);
        expect(element(by.id('unreportGame')).isDisplayed()).toBe(false);
    });

    describe('match reporting', function(){
        it('should be able to report a finished game', function () {
            browser.get(homeAddress);

            e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
            e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('');
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(false);
            element(by.id('reportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'score1');
            element(by.id('score1')).sendKeys(2);

            element(by.id('doReport')).click();

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(false);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(true);
        });

        it('should not touch anything if the user hits the cancel button while reporting', function(){
            browser.get(homeAddress);

            e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
            e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('');

            element(by.id('reportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'score1');
            element(by.id('score1')).sendKeys(2);

            element(by.id('cancelReport')).click();

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(true);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(false);
        });

    });
    describe('match unreporting', function(){
        it('should be able to unreport a game', function(){
            browser.get(homeAddress);

            e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
            e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(true);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(false);

            element(by.id('reportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'score1');
            element(by.id('score1')).sendKeys(2);

            element(by.id('doReport')).click();

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(false);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(true);
            element(by.id('unreportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
            element(by.id('doUnreport')).click();

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(true);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(false);
        });

        it('should not do anything if the user hits the cancel button while unreporting', function(){
            browser.get(homeAddress);

            e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
            e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(true);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(false);

            element(by.id('reportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'score1');
            element(by.id('score1')).sendKeys(2);

            element(by.id('doReport')).click();

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(false);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(true);
            element(by.id('unreportGameButton')).click();
            e2eUtils.waitForElementToBeVisible(browser, element, by, 'doUnreport');
            element(by.id('cancelUnreport')).click();

            expect(element(by.xpath('//select[@id="reportGame"]')).getText()).toBe('');
            expect(element(by.xpath('//select[@id="unreportGame"]')).getText()).toBe('test1 VS test2');
            expect(element(by.id('reportGameButton')).isDisplayed()).toBe(false);
            expect(element(by.id('unreportGameButton')).isDisplayed()).toBe(true);
        });
    });

});