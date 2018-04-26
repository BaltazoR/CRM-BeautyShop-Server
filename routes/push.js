let express = require('express');
let router = express.Router();
let fmain = require('../functions/fmain');
let webPush = require('web-push');
let Push = require('../models/push.models');

// User subscribe
router.post('/subscribe', function (req, res) {

    let push = new Push({
        endpoint: req.body.endpoint,
        keys: {
            p256dh: req.body.keys.p256dh,
            auth: req.body.keys.auth
        }
    });

    push.save(function (err, push) {
        if (err) {
            console.error('error with subscribe', err);
            res.status(500).json({ status: 'subscription not possible' });
            return;
        }

        let notificationPayload = {
            "notification": {
                "title": "Welcome",
                "body": "Thank you for enabling push notifications",
                "icon": "https://s3.eu-central-1.amazonaws.com/aws-avatars/push-icon.png",
                /* "vibrate": [100, 50, 100],
                        "data": {
                            "dateOfArrival": Date.now(),
                            "primaryKey": 1
                        },
                        "actions": [{
                            "action": "explore",
                            "title": "Go to the site"
                        }] */
            }
        };

        let payload = JSON.stringify(notificationPayload);

        let options = {
            TTL: 86400 // 3 days
        };

        let subscription = {
            endpoint: push.endpoint,
            keys: {
                p256dh: push.keys.p256dh,
                auth: push.keys.auth
            }
        };

        setTimeout(
            function () {
                webPush.sendNotification(
                    subscription,
                    payload,
                    options
                ).then(function () {
                    console.log("Send welcome push notification");
                    fmain.sendJSONresponse(res, 200, {
                        message: "Push notification sended"
                    });
                }).catch(err => {
                    console.error("Unable to send welcome push notification", err);
                    fmain.sendJSONresponse(res, 404, err);
                });
            }, 5000
        );

        /*fmain.sendJSONresponse(res, 200, {
            status: "subscribe"
        }); */

        return;
    });
});

// User unsubscribe
router.post('/unsubscribe', function (req, res) {

    let endpoint = req.body.endpoint;

    Push.findOneAndRemove({ endpoint: endpoint }, function (err, data) {
        if (err) {
            console.error('error with unsubscribe', error);
            fmain.sendJSONresponse(res, 500, err);
            //res.status(500).json({ status: 'unsubscription not possible' });
        }
        console.log(data);
        console.log('unsubscribed');
        fmain.sendJSONresponse(res, 200, {
            status: "unsubscribe"
        });
    });
});

// Check if the user is subscribed
router.get('/checksubscribe/:id', function (req, res) {
    if (req.params && req.params.id) {
        Push
            .findOne({userId: req.params.id})
            .exec(function (err, user) {
                if (!user) {
                    fmain.sendJSONresponse(res, 404, {
                        message: "User not subscribed"
                    });
                    return;
                } else if (err) {
                    fmain.sendJSONresponse(res, 404, err);
                    return;
                }
                fmain.sendJSONresponse(res, 200, {
                    message: "User subscribed"
                });
            });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id in request"
        });
    }

});

module.exports = router;
