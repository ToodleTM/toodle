'use strict';
var homeAddress = 'http://localhost:9042';
var e2eUtils = require('./e2eUtils');
describe('User having the admin link of a tournament', function () {
    it('should be able to edit all fields', function () {
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        var game = element(by.id('game'));
        var description = element(by.id('description'));
        var engine = element(by.id('engine'));
        var datePicker = element(by.id('tournamentStart'));
        var reportRights = element(by.id('reportRights-1'));
        game.sendKeys('sc2');
        description.sendKeys('this is a test');
        engine.sendKeys('Single elim. bracket w/');
        datePicker.sendKeys('12/01/2014');
        reportRights.click();

        element(by.id('modifyTournament')).click();
        //browser.refresh(); // => seems to be broken w/ phantomjs, don't know why right now
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'description');
        expect(game.getAttribute('value')).toEqual('sc2');
        expect(description.getAttribute('value')).toEqual('this is a test');
        expect(engine.getAttribute('value')).toEqual('singleElim');
        expect(datePicker.getAttribute('value')).toEqual('12/01/2014');
        expect(element(by.xpath('//div[@id="reportRights"]//input[@id="reportRights-0"]')).getAttribute('checked')).toEqual(null);
        expect(element(by.xpath('//div[@id="reportRights"]//input[@id="reportRights-1"]')).getAttribute('checked')).toEqual('true');
        expect(element(by.xpath('//div[@id="reportRights"]//input[@id="reportRights-2"]')).getAttribute('checked')).toEqual(null);
        expect(element(by.id('updateOk')).getText()).toMatch(/×\nClose\nTournament specs successfully updated/g);

    });

    it('Should be able to lock and unlock a tournament', function(){
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');
        expect(element(by.id('lockTournament')).getText()).toEqual('Lock registrations');
        element(by.id('lockTournament')).click();
        expect(element(by.id('lockTournament')).getText()).toEqual('Open registrations');
    });

    it('should not be able to unlock a tournament that has started', function(){
        browser.get(homeAddress);
        e2eUtils.createTournamentAndGoToPage(browser, element, by, 'adminLink');

        e2eUtils.configureTheTournamentAndStartIt(browser, element, by);

        expect(element(by.id('lockTournament')).isPresent()).toBe(false);
    });
});