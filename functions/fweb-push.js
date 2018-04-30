//let fmain = require('../functions/fmain');
let webPush = require('web-push');
let Push = require('../models/push.models');


module.exports.Notification = function (push, notificationPayload) {
    let options = {
        TTL: 86400 // 3 days
    };

    notificationPayload.notification.icon = 'https://s3.eu-central-1.amazonaws.com/aws-avatars/push-icon.png';

    let subscription = {
        endpoint: push.endpoint,
        keys: {
            p256dh: push.keys.p256dh,
            auth: push.keys.auth
        }
    };

    let payload = JSON.stringify(notificationPayload);
    webPush.sendNotification(
        subscription,
        payload,
        options
    ).then(function () {
        console.log("Push notification sended successful");
    }).catch(err => {
        console.log('error(push notification):', err.message);
        //fmain.sendJSONresponse(res, 404, err.message);
        return;
    });
};

// send webPush
module.exports.notification = function (userId, notification) {
    Push
        .find({ userId: userId }, function (err, users) {
            if (err) {
                console.log(err.message);
                return;
            }
            if (users.length !== 0) {
                users.forEach(user => {
                    let options = {
                        TTL: 86400 // 3 days
                    };
                    let notificationPayload = {
                        "notification": {
                            "title": notification.title,
                            "body": notification.body,
                            "icon": 'https://s3.eu-central-1.amazonaws.com/aws-avatars/push-icon.png'
                        }
                    };
                    let subscription = {
                        endpoint: user.endpoint,
                        keys: {
                            p256dh: user.keys.p256dh,
                            auth: user.keys.auth
                        }
                    };
                    let payload = JSON.stringify(notificationPayload);

                    webPush.sendNotification(
                        subscription,
                        payload,
                        options
                    ).then(function () {
                        console.log("Push notification sended successful");
                    }).catch(err => {
                        console.log('error(push notification):', err.message);
                        return;
                    });
                });
            }
        });
}
