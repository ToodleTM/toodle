'use strict';
var homeAddress = 'http://localhost:9042';
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


describe('App tiitle', function () {
    it('Should be Toodle', function () {
        browser.get(homeAddress);

        expect(browser.getTitle()).toEqual('Toodle');
    });
});

describe('Homepage', function () {
    it('Should show a form w/ one field and a go button', function () {
        browser.get(homeAddress);

        expect(element(by.id('registerLabel')).getText(), 'Register a new Tournament!');
    });

    it('Should display an error if the user tries to register a tournament w/ an empty name', function () {
        browser.get(homeAddress);
        element(by.id('registerTournamentButton')).click();
        expect(element(by.id('tourneyCreationKo')).getText()).toMatch(/×\nClose\nSomething bad happened, the tournament was not created. Please try again. \(Reason : Tournament name must not be blank\)/g);
        //.toEqual('×\nClose\nSomething bad happened, the tournament was not created. Please try again. (Reason : Tournament name must not be blank)');
    });

    it("Sould display an OK message if the tournament has been successfully created", function () {
        browser.get(homeAddress);
        element(by.id('tournamentName')).sendKeys('protractor');
        element(by.id('registerTournamentButton')).click();

        var tourneyConfirmationBox = element(by.id('tourneyCreationOk'));
        expect(tourneyConfirmationBox.getText()).toMatch(/×\nClose\nThe tournament has been created! You can administer it using this link , and you can send this link to allow your users to enroll./g)
    });

});