let express = require('express');
let router = express.Router();
let fmain = require('../functions/fmain');
//let webPush = require('web-push');
let Push = require('../models/push.models');
let fauth = require('../functions/fauth');
let sendPush = require('../functions/fweb-push');

// User subscribe
router.post('/subscribe', fauth.checkAuth, function (req, res) {

    console.log('req.body:', req.body);
    console.log('req.user.id:', req.user.id);

    if (req.body && req.user && req.body.endpoint && req.body.keys.p256dh && req.body.keys.auth) {
        webPush = Push.create({
            userId: req.user.id,
            endpoint: req.body.endpoint,
            keys: {
                p256dh: req.body.keys.p256dh,
                auth: req.body.keys.auth
            }
        }, function (err) {
            if (err) {
                fmain.sendJSONresponse(res, 400, err.message);
            } else {

                let notification = {};
                notification.title = 'Welcome to BeatyShop';
                notification.body = "Thank you for enabling push notifications";
                sendPush.notification(req.user.id, notification);

                fmain.sendJSONresponse(res, 200, {
                    subscribed: true
                });
            }
        });
    } else {
        fmain.sendJSONresponse(res, 400, {
            "message": "All required fields must be filled"
        });
    }
});

// User unsubscribe
router.post('/unsubscribe', fauth.checkAuth, function (req, res) {
    if (req.body && req.user && req.body.endpoint && req.user.id) {
        Push.findOneAndRemove({ userId: req.user.id, endpoint: req.body.endpoint }, function (err) {
            if (err) {
                fmain.sendJSONresponse(res, 500, err.message);
            }
            console.log('unsubscribed');
            fmain.sendJSONresponse(res, 200, {
                subscribed: false
            });
        });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no userId or endpoint in request"
        });
    }
});

// Check if the user is subscribed
router.post('/checksubscribe', fauth.checkAuth, function (req, res) {
    if (req.body && req.user && req.body.endpoint && req.user.id) {
        Push
            .findOne({ userId: req.user.id, endpoint: req.body.endpoint })
            .exec(function (err, user) {
                if (!user) {
                    fmain.sendJSONresponse(res, 200, {
                        subscribed: false
                    });
                    return;
                } else if (err) {
                    fmain.sendJSONresponse(res, 404, err.message);
                    return;
                }
                fmain.sendJSONresponse(res, 200, {
                    subscribed: true
                });
            });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no userId or endpoint in request"
        });
    }

});

module.exports = router;
