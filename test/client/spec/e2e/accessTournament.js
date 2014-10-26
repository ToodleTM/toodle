'use strict';
var homeAddress = 'http://localhost:9042';

describe('ADMIN - Unknown tournament', function () {
    it('should get a 404 message if ID is valid but tournament does not exist', function () {
        browser.get(homeAddress+'/admin/123456789012345678901234');

        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID is too long', function () {
        browser.get(homeAddress+'/admin/123456789012345678901234asdfasdf');

        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID is too short', function () {
        browser.get(homeAddress+'/admin/1234567890123');

        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID contains invalid characters', function () {
        browser.get(homeAddress+'/admin/1234567890123456789012zz');

        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });
});
