let sgMail = require('@sendgrid/mail');
let userUrl = 'http://127.0.0.1:4200/users/';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

if (process.env.NODE_ENV === 'production') {
    userUrl = 'http://beauty-shop.s3-website.eu-central-1.amazonaws.com/users/';
}

module.exports.sendEmail = function (addressee, entry, subject, withoutStatus) {
    if (subject === undefined) subject = 'Your order status has been changed';
    let emailMsg = {
        from: 'no-reply@beutyshop.com',
        subject: subject,
        text: 'Entry on: ' + entry.date + ' at ' + entry.time + '\r\n',
        html: `<p>Entry on: ${entry.date}  at ${entry.time}</p>`
    };

    if (addressee === 'master') {
        emailMsg.to = entry.masterId.email;

        emailMsg.text += 'Customer name: ' + entry.customerId.name + '\r\n';
        emailMsg.html += '<p>Customer name: <a href="' + userUrl + entry.customerId.id + '/">' + entry.customerId.name + '<a></p>';

        emailMsg.text += 'Customer phone number: ' + entry.customerId.phoneNumber + '\r\n';
        emailMsg.html += '<p>Customer phone number: ' + entry.customerId.phoneNumber + '</p>';

        if (withoutStatus === undefined) {
            emailMsg.text += 'Status has been changed to : ' + entry.status + '\r\n';
            emailMsg.html += '<p>Status has been changed to : <b>' + entry.status + '</b></p>';
        }


        if (entry.customerComment.length > 0) {
            emailMsg.text += 'comment for entry: ' + entry.customerComment;
            emailMsg.html += '<p>comment for entry: ' + entry.customerComment + '</p>';
        }

    } else if (addressee === 'customer') {
        emailMsg.to = entry.customerId.email;

        emailMsg.text += 'Master name: ' + entry.masterId.name + '\r\n';
        emailMsg.html += '<p>Master name: <a href="' + userUrl + entry.masterId.id + '/">' + entry.masterId.name + '<a></p>';

        emailMsg.text += 'Master phone number: ' + entry.masterId.phoneNumber + '\r\n';
        emailMsg.html += '<p>Master phone number: ' + entry.masterId.phoneNumber + '</p>';

        if (withoutStatus === undefined) {
            emailMsg.text += 'Status has been changed to : ' + entry.status + '\r\n';
            emailMsg.html += '<p>Status has been changed to : <b>' + entry.status + '</b></p>';
        }

        if (entry.masterComment.length > 0) {
            emailMsg.text += 'comment for entry: ' + entry.masterComment;
            emailMsg.html += '<p>comment for entry: ' + entry.masterComment + '</p>';
        }
    } else {
        console.log('Email not send');
        return;
    }

    sgMail.send(emailMsg);
}

