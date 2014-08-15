'use strict';
var Utils = function(){};

function toggleState (value){
    return !value;
}
Utils.prototype.toggleState = function(value){
    return toggleState(value);
};

module.exports.Utils = Utils;