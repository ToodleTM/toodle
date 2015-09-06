'use strict';
var loginController = require('../../controllers/login');
var passport = require('passport');
var express = require('express');
var router = express.Router();
var index = require('../../controllers');
var middleware = require('../../middleware');

router.get('/login', loginController.initLoginFlow, passport.authenticate('twitter'), function (req, res, next) {
    next();
});
router.get('/twitter_callback',
    function(req, res, next){
        passport.authenticate('twitter',
            function(err, user){
                if(!err){
                    req.session.passport.user = user;
                    return res.redirect('/success');
                } else {
                    return res.redirect('/failure');
                }
            }
        )(req, res, next);
    }
);
router.get('/gplus_callback', loginController.gplusGetAuthzCode, passport.authenticate('google'), function (req, res) {
    res.redirect('/success');
});
router.get('/success', loginController.success);
router.get('/get-session-data', loginController.sessionData);
router.get('/failure', loginController.fail);
router.get('/logout', loginController.logout);

router.get('/partials/*', index.partials);
router.get('/*', middleware.setUserCookie, index.index);

module.exports = router;