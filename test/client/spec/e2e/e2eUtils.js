'use strict';
var E2eUtils = function(){}

E2eUtils.prototype.waitForElementToBeVisible = function(browser, element, by, elementId){
    browser.wait(function(){
        return element(by.id(elementId)).isDisplayed();
    });
};

module.exports = new E2eUtils();