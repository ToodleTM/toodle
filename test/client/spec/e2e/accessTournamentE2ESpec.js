'use strict';
describe('ADMIN - Unknown tournament', function () {
    it('should get a 404 message if ID is valid but tournament does not exist', function () {
        browser.get('/admin/123456789012345678901234');
        var errorElement = element(by.id('error'));
        expect(errorElement.isDisplayed()).toBe(true);
        expect(errorElement.getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID is too long', function () {
        browser.get('/admin/123456789012345678901234asdfasdf');
        var errorElement = element(by.id('error'));
        expect(errorElement.isDisplayed()).toBe(true);
        expect(errorElement.getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID is too short', function () {
        browser.get('/admin/1234567890123');
        var errorElement = element(by.id('error'));
        expect(errorElement.isDisplayed()).toBe(true);
        expect(errorElement.getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID contains invalid characters', function () {
        browser.get('/admin/1234567890123456789012zz');
        var errorElement = element(by.id('error'));
        expect(errorElement.isDisplayed()).toBe(true);
        expect(errorElement.getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });
});

describe('USER - Unknown tournament', function () {
    it('should get a 404 message if ID is valid but tournament does not exist (/play)', function () {
        browser.get('/play/16players0000000000000');
        var notFoundElement = element(by.id('notFound'));
        expect(notFoundElement.isDisplayed()).toBe(true);
        expect(notFoundElement.getText()).toBe('No such tournament seems to exist, are you sure it\'s the right URL ?');
    });
});
