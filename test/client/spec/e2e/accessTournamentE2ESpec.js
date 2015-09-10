'use strict';
var e2eUtils = require('./e2eUtils.js');
describe('ADMIN - Unknown tournament', function () {
    it('should get a 404 message if ID is valid but tournament does not exist', function () {
        browser.get('/admin/123456789012345678901234');
        browser.waitForAngular();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'error');
        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID is too long', function () {
        browser.get('/admin/123456789012345678901234asdfasdf');
        browser.waitForAngular();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'error');
        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID is too short', function () {
        browser.get('/admin/1234567890123');
        browser.waitForAngular();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'error');
        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });

    it('should get a 404 message if ID contains invalid characters', function () {
        browser.get('/admin/1234567890123456789012zz');
        browser.waitForAngular();
        e2eUtils.waitForElementToBeVisible(browser, element, by, 'error');
        expect(element(by.id('error')).getText(), 'No such tournament has been registered, check your URL or go back to the main page to create a new tournament.');
    });
});

describe('USER - Unknown tournament', function () {
    it('should get a 404 message if ID is valid but tournament does not exist (/play)', function () {
        browser.get('/play/16players0000000000000');
        browser.waitForAngular();
        expect(element(by.id('notFound')).getText(), 'No such tournament seems to exist, are you sure it\'s the right URL ?');
    });
});
