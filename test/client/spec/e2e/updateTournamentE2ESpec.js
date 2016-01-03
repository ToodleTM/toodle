'use strict';
describe('User having the admin link of a tournament', function () {
    beforeEach(function () {
        browser.get('');
        browser.waitForAngular();
    });
    it('should be able to edit all fields', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('description')).sendKeys('this is a test');
        element(by.id('tournamentStart')).sendKeys('1970-01-01');
        element(by.id('registerTournamentButton')).click();
        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
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

    it('should display a factions list and allow to register a player with a specific faction', function () {
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.xpath('//select[@name="inputFaction"]')).sendKeys('Starcraft 2 - Terran');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doConfigure')).click();

        element(by.id('displaySettings')).click();
        element(by.id('playerManagement')).click();

        element(by.id('inputNick')).sendKeys('player 2');
        element(by.xpath('//select[@name="inputFaction"]')).sendKeys('Starcraft 2 - Zerg');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.xpath('//ul[@id="sortablePlayerList"]/li[1]/span/span/div')).getAttribute('class')).toContain('icon-terran-16 player-icon right');
        expect(element(by.xpath('//ul[@id="sortablePlayerList"]/li[2]/span/span/div')).getAttribute('class')).toContain('icon-zerg-16 player-icon right');
    });

    it('should be able to unpublish a tournament (tournament not started)', function(){
        let time = (new Date()).getTime();
        element(by.id('tournamentName')).sendKeys('protractor_public_test_'+time);
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doConfigure')).click();

        element(by.id('menuButton')).click();
        element(by.id('menu-tournamentList')).click();

        expect(element(by.id('tournamentsList')).getText()).toContain('protractor_public_test_'+time);
        browser.navigate().back();

        element(by.id('displaySettings')).click();
        element(by.id('public_no')).click();

        element(by.id('menuButton')).click();
        element(by.id('menu-tournamentList')).click();

        expect(element(by.id('tournamentsList')).getText()).not.toContain('protractor_public_test_'+time);

        browser.navigate().back();

        element(by.id('displaySettings')).click();
        element(by.id('public_yes')).click();

        element(by.id('menuButton')).click();
        element(by.id('menu-tournamentList')).click();

        expect(element(by.id('tournamentsList')).getText()).toContain('protractor_public_test_' + time);
    });

    it('should be able to unpublish a tournament (tournament started)', function () {
        let time = (new Date()).getTime();
        element(by.id('tournamentName')).sendKeys('protractor_public_test_' + time);
        element(by.id('registerTournamentButton')).click();

        element(by.id('inputNick')).sendKeys('player 1');
        element(by.id('registerPlayerGo')).click();
        element(by.id('inputNick')).sendKeys('player 2');
        element(by.id('registerPlayerGo')).click();

        element(by.id('runTournament')).click();
        element(by.id('doStart')).click();

        element(by.id('menuButton')).click();
        element(by.id('menu-tournamentList')).click();

        expect(element(by.id('tournamentsList')).getText()).toContain('protractor_public_test_' + time);
        browser.navigate().back();

        element(by.id('displaySettings')).click();
        element(by.id('public_no')).click();

        element(by.id('menuButton')).click();
        element(by.id('menu-tournamentList')).click();

        expect(element(by.id('tournamentsList')).getText()).not.toContain('protractor_public_test_' + time);

        browser.navigate().back();

        element(by.id('displaySettings')).click();
        element(by.id('public_yes')).click();

        element(by.id('menuButton')).click();
        element(by.id('menu-tournamentList')).click();

        expect(element(by.id('tournamentsList')).getText()).toContain('protractor_public_test_' + time);
    });
});