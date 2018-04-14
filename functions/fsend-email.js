let sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
let fmain = require('../functions/fmain');
let baseUrl = 'http://127.0.0.1:4200/';

if (process.env.NODE_ENV === 'production') {
    baseUrl = 'http://beauty-shop.s3-website.eu-central-1.amazonaws.com/';
}


module.exports.sendEmail = function (to, subject, text, html, from) {
    if (from === undefined) from = 'no-reply@beutyshop.com';
    const msg = {
        to: to,
        from: from,
        subject: subject,
        text: text,
        html: html,
    };
    sgMail.send(msg);
}

module.exports.templateEmailOrder = function (entry, role, withoutStatus) {

    let text = 'Entry on: ' + entry.date + ' at ' + entry.time + '\r\n';
    let html = `<p>Entry on: ${entry.date}  at ${entry.time}</p>`;

    if (role === 'master') {

        text += 'Customer name: ' + entry.customerId.name + '\r\n';
        html += '<p>Customer name: <a href="' + baseUrl + 'users/' + entry.customerId.id + '/">' + entry.customerId.name + '<a></p>';

        text += 'Customer phone number: ' + entry.customerId.phoneNumber + '\r\n';
        html += '<p>Customer phone number: ' + entry.customerId.phoneNumber + '</p>';

        if (withoutStatus === undefined) {
            text += 'Status has been changed to : ' + entry.status + '\r\n';
            html += '<p>Status has been changed to : <b>' + entry.status + '</b></p>';
        }

        if (entry.customerComment.length > 0) {
            text += 'comment for entry: ' + entry.customerComment;
            html += '<p>comment for entry: ' + entry.customerComment + '</p>';
        }

    } else if (role === 'customer') {

        text += 'Master name: ' + entry.masterId.name + '\r\n';
        html += '<p>Master name: <a href="' + baseUrl + 'users/' + entry.masterId.id + '/">' + entry.masterId.name + '<a></p>';

        text += 'Master phone number: ' + entry.masterId.phoneNumber + '\r\n';
        html += '<p>Master phone number: ' + entry.masterId.phoneNumber + '</p>';

        if (withoutStatus === undefined) {
            text += 'Status has been changed to : ' + entry.status + '\r\n';
            html += '<p>Status has been changed to : <b>' + entry.status + '</b></p>';
        }


        if (entry.masterComment.length > 0) {
            text += 'comment for entry: ' + entry.masterComment;
            html += '<p>comment for entry: ' + entry.masterComment + '</p>';
        }
    }
    return {
        text: text,
        html: html
    }
}

module.exports.templateEmailReqPass = function (ip, token) {
    text = `
You have requested password recovery from ip: ${ip}.
Please follow this link:
${baseUrl}${token}
to reset your password.
---
If it was not you, do not react to this letter.
`;
    html = `
<p>You have requested password recovery from ip: ${ip}.</p>
<p>Please follow this <a href="${baseUrl}?token=${token}">link</a> to reset your password.</p>
<hr>
<font color = "red"><b>If it was not you, do not react to this letter.</b></font>
`;
    return {
        text: text,
        html: html
    }
}
