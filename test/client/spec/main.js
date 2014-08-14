'use strict'
var homeAddress = 'http://localhost:9042'
// spec.js
// Add the custom locator.
by.addLocator('label', function (labelText, opt_parentElement) {
    // This function will be serialized as a string and will execute in the
    // browser. The first argument is the text for the label. The second
    // argument is the parent element, if any.
    var using = opt_parentElement || document,
        labels = using.querySelectorAll('label');

    // Return an array of labels with the text.
    return Array.prototype.filter.call(labels, function (label) {
        return label.textContent === labelText;
    });
});


describe('Check the title', function () {
    it('should have a title', function () {
        browser.get(homeAddress);

        expect(browser.getTitle()).toEqual('Toodle');
    });
});

describe('Homepage', function () {
    it('Should show a form w/ one field and a go button', function () {
        browser.get(homeAddress);

        expect(element(by.id('registerLabel')).getText(), 'Register a new Tournament!');
    })

    it('Should display an error if the user tries to register a tournament w/ an empty name', function () {
        browser.get(homeAddress);
        element(by.id('registerTournamentButton')).click();
        expect(element(by.id('tourneyCreationKo')).getText()).toMatch(/×\nClose\nSomething bad happened, the tournament was not created. Please try again. \(Reason : Tournament name must not be blank\)/g)
        //.toEqual('×\nClose\nSomething bad happened, the tournament was not created. Please try again. (Reason : Tournament name must not be blank)');
    });

    it("Sould display an OK message if the tournament has been successfully created", function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g)
    });

    it("Should go to an admin page when a tournament is created and we click on the admin link, then edit settings and validate", function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g)
        element(by.id('adminLink')).click();
        var game = element(by.model('tournamentInfo.game'));
        var description = element(by.model('tournamentInfo.description'));
        var engine = element(by.model('tournamentInfo.engine'));
        var numberOfPlayers = element(by.model('tournamentInfo.numberOfPlayers'));
        var roundFormat = element(by.model('tournamentInfo.roundFormat'));
        expect(game.getAttribute('value')).toEqual('');
        expect(description.getAttribute('value')).toEqual('');
        expect(engine.getAttribute('value')).toEqual('');
        expect(numberOfPlayers.getAttribute('value')).toEqual('');
        expect(roundFormat.getAttribute('value')).toEqual('');
        game.sendKeys("sc2");
        description.sendKeys("this is a test");
        engine.sendKeys("Single elim. bracket w/");
        numberOfPlayers.sendKeys("16");
        roundFormat.sendKeys("Best of 7");
        element(by.id('modifyTournament')).click();
        //browser.refresh(); // => seems to be broken w/ phantomjs, don't know why right now
        expect(game.getAttribute('value')).toEqual('sc2');
        expect(description.getAttribute('value')).toEqual('this is a test');
        expect(engine.getAttribute('value')).toEqual('2');
        expect(numberOfPlayers.getAttribute('value')).toEqual('16');
        expect(roundFormat.getAttribute('value')).toEqual('7');
    });

    it('Should be able to look at a created tournament on the "play" section and then register once', function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g)
        element(by.id('signupLink')).click();
        var game = element(by.model('tournamentInfo.game'));
        var description = element(by.model('tournamentInfo.description'));
        var engine = element(by.model('tournamentInfo.engine'));
        var numberOfPlayers = element(by.model('tournamentInfo.numberOfPlayers'));
        var roundFormat = element(by.model('tournamentInfo.roundFormat'));
        var playersList = element(by.id('playersList'));
        expect(game.getAttribute('value')).toEqual('');
        expect(game.getAttribute('disabled')).toBeTruthy();
        expect(description.getAttribute('value')).toEqual('');
        expect(description.getAttribute('disabled')).toBeTruthy();
        expect(engine.getAttribute('value')).toEqual('');
        expect(engine.getAttribute('disabled')).toBeTruthy();
        expect(numberOfPlayers.getAttribute('value')).toEqual('');
        expect(numberOfPlayers.getAttribute('disabled')).toBeTruthy();
        expect(roundFormat.getAttribute('value')).toEqual('');
        expect(roundFormat.getAttribute('disabled')).toBeTruthy();
        expect(playersList.getText()).toEqual('Registered players (0)\nNo registered players at the moment');
        var nickInput = element(by.id("inputNick"));
        nickInput.sendKeys('protractest_newRegistration');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playerList')).getText()).toEqual('protractest_newRegistration');
        expect(element(by.id('registrationOk')).getText()).toEqual('×\nClose\nSuccessfully registered');
        nickInput.sendKeys('protractest_newRegistration');
        element(by.id('registerPlayerGo')).click();
        expect(element(by.id('playerList')).getText()).toEqual('protractest_newRegistration');
        expect(element(by.id('registrationKo')).getText()).toEqual('×\nClose\nPlayer registration failed (Reason : A player with that name is already registered)');
    });

});