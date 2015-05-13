'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AvailableEngineSchema = new Schema({
    version: String,
    description: String,
    compatible: [String],
    name:String
});


module.exports = mongoose.model('AvailableEngines', AvailableEngineSchema);
