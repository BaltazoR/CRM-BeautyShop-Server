//let fmain = require('../functions/fmain');
let webPush = require('web-push');


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
