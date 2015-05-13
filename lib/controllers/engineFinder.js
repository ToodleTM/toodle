'use strict';

var mongoose = require('mongoose');

exports.listAvailableEngines = function(callback){
    var AvailableEngine = mongoose.model('AvailableEngines');
    AvailableEngine.find({}, function(err, data){
        callback(err, data);
    });
};

exports.lookup = function(req, res){
    var baseList = [{version:'0', description:' --- ', compatible:[], name:''}];
    exports.listAvailableEngines(function(err, data){
        var enginesList = baseList.concat(data);
        res.status(200).json(enginesList);
    });
};