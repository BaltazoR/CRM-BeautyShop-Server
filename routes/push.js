let express = require('express');
let router = express.Router();
let webPush = require('web-push');
let Push = require('../models/push.models');

router.post('/subscribe', function (req, res) {

    const endpoint = req.body;

    const push = new Push({
        endpoint: endpoint.endpoint,
        keys: {
            p256dh: endpoint.keys.p256dh,
            auth: endpoint.keys.auth
        }
    });

    push.save(function (err, push) {
        if (err) {
            console.error('error with subscribe', error);
            res.status(500).send('subscription not possible');
            return;
        }

        const payload = JSON.stringify({
            title: 'Welcome',
            body: 'Thank you for enabling push notifications',
            icon: '/push-icon.png'
        });

        const options = {
            TTL: 86400 // 3 days
        };

        const subscription = {
            endpoint: push.endpoint,
            keys: {
                p256dh: push.keys.p256dh,
                auth: push.keys.auth
            }
        };

        webPush.sendNotification(
            subscription,
            payload,
            options
        ).then(function () {
            console.log("Send welcome push notification");
        }).catch(err => {
            console.error("Unable to send welcome push notification", err);
        });
        res.status(200).json({status: 'subscribe'});
        return;
    });
});


router.post('/unsubscribe', function (req, res) {

    const endpoint = req.body.endpoint;

    Push.findOneAndRemove({ endpoint: endpoint }, function (err, data) {
        if (err) {
            console.error('error with unsubscribe', error);
            res.status(500).send('unsubscription not possible');
        }
        console.log(data);
        console.log('unsubscribed');
        res.status(200).send('unsubscribe');
    });
});

module.exports = router;
