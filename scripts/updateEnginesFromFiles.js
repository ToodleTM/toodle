'use strict';
var path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    AvailableEngine = require('../lib/models/availableEngine');

var config = require('../lib/config/config');
var db = null;
if (process.env.NODE_ENV !== 'maintenance') {
    db = mongoose.connect(config.mongo.uri, config.mongo.options);
}

AvailableEngine.remove({}, function (err) {
    if (err) {
        console.error('Could not read available engines list in DB, aborting.');
        console.error(err);
        process.exit(1);
    } else {
        var enginesPath = path.join(__dirname, '../lib/engines');
        var enginesToSave = [];
        fs.readdirSync(enginesPath).forEach(function (file) {
            if (/(.*)\.(js$)/.test(file)) {
                var engine = new (require(enginesPath + '/' + file).Engine)();
                if (engine.meta) {
                    var newEngine = new AvailableEngine();
                    newEngine.version = engine.meta.version;
                    newEngine.description = engine.meta.description;
                    newEngine.compatible = engine.meta.compatible;
                    newEngine.name = engine.meta.name;
                    console.log('Adding ' + file + ' configuration to engine list');
                    enginesToSave.push(newEngine);
                } else {
                    console.log('Skipping '+file+' (no meta property)');
                }
            }
        });
        AvailableEngine.create(enginesToSave, function (err) {
            if (err) {
                console.error('Error while inserting data in db');
                console.error(err);
            } else {
                console.log('All done!');
                process.exit(0);
            }
        });
    }
});
