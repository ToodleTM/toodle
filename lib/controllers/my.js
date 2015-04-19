'use strict';
var mongoose = require('mongoose');

exports.getTournamentUser = function(){
    var TournamentUser = mongoose.model('TournamentUsers');
    return TournamentUser;
};

exports.getTournaments = function (req, res) {
    if(req.session && req.session.passport && req.session.passport.user) {
        if (req.query.type) {
            if (req.query.type === 'admin') {
                this.getTournamentUser().find({
                    admin: true,
                    socialId: req.session.passport.user.id
                }, function (err, data) {
                    res.status(200).send({admin: data});
                });
            } else if(req.query.type === 'created') {
                this.getTournamentUser().find({
                    creator: true,
                    socialId: req.session.passport.user.id
                }, function (err, data) {
                    res.status(200).send({created: data});
                });
            } else {
                res.status(400).send({error: 'unknownType', message: 'provided type is unknown'});
            }
        } else {
            res.status(401).send({error: 'noTypeProvided', message: 'no tournament type provided'});
        }
    } else {
        res.status(401).send({error: 'noSession', message: 'User has no session'});
    }
};
