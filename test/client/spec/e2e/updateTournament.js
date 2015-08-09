'use strict';
var homeAddress = 'http://localhost:9042';
describe('User having the admin link of a tournament', function () {
    beforeEach(function(){
        browser.get(homeAddress);
    });
    it('should be able to edit all fields', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('description')).sendKeys('this is a test');
        element(by.id('tournamentStart')).sendKeys('1970-01-01');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('displaySettings')).click();
        var description = element(by.id('description'));
        var engine = element(by.id('engine'));
        var datePicker = element(by.id('tournamentStart'));

        element(by.id('reportRights-1')).click();

        expect(datePicker.getAttribute('value')).toEqual('01-01-1970');
        expect(description.getAttribute('value')).toEqual('this is a test');
        expect(engine.getAttribute('value')).toEqual('singleElim');
        expect(element(by.xpath('//div[@id="reportRights"]//input[@id="reportRights-0"]')).getAttribute('checked')).toEqual(null);
        expect(element(by.xpath('//div[@id="reportRights"]//input[@id="reportRights-1"]')).getAttribute('checked')).toEqual('true');
        expect(element(by.xpath('//div[@id="reportRights"]//input[@id="reportRights-2"]')).getAttribute('checked')).toEqual(null);
    });
});