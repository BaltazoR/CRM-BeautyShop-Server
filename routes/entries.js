let express = require('express');
let router = express.Router();
let User = require('../models/users.models');
let Entries = require('../models/entries.models');
//require('dotenv').config();
//let passport = require('passport');
//let jwt = require('jsonwebtoken');
let fmain = require('../functions/fmain');
let fauth = require('../functions/fauth');
let sgMail = require('@sendgrid/mail');
let userUrl = 'http://127.0.0.1:4200/users/';

if (process.env.NODE_ENV === 'production') {
    userUrl = 'http://beauty-shop.s3-website.eu-central-1.amazonaws.com/users/';
}

// Create entry (Done)
router.post('/entries', function (req, res) {
    if (req.body && req.body.masterId && req.body.customerId && req.body.date && req.body.time) {
        entry = Entries.create({
            masterId: req.body.masterId,
            customerId: req.body.customerId,
            date: req.body.date,
            time: req.body.time,
            //masterComment: req.body.masterComment,
            customerComment: req.body.customerComment
        }, function (err, entry) {
            if (err) {
                fmain.sendJSONresponse(res, 400, err);
            } else {
                if (entry.id) {
                    Entries.findById(entry.id)
                        .populate('masterId', '-password -ip -addedAt')
                        .populate('customerId', '-password -ip -addedAt')
                        .exec(function (err, entry) {
                            if (!entry) {
                                fmain.sendJSONresponse(res, 404, {
                                    message: "entries not create"
                                });
                                return;
                            } else if (err) {
                                fmain.sendJSONresponse(res, 400, err);
                                return;
                            }
                            fmain.sendJSONresponse(res, 201, entry);
                            return;
                        });
                } else {
                    fmain.sendJSONresponse(res, 404, {
                        message: "entries not create"
                    });
                    return;
                }
            }
        });
    } else {
        fmain.sendJSONresponse(res, 400, {
            "message": "All required fields must be filled"
        });
        return;
    }
});

// Send all Entries to front (Done)
router.get('/entries', function (req, res) {
    Entries.find({})
        .populate('masterId', '-password -ip -addedAt')
        .populate('customerId', '-password -ip -addedAt')
        .exec(function (err, entries) {
            if (err) {
                fmain.sendJSONresponse(res, 404, err);
                return;
            }
            if (entries) {
                let entriesOut = [];
                entries.forEach(element => {
                    entriesOut.push(element);
                });
                fmain.sendJSONresponse(res, 200, entriesOut);
                return;
            } else {
                fmain.sendJSONresponse(res, 404, {
                    message: "entries not found"
                });
                return;
            }

        })
});

/** Get Entry(entries) by id (Done)
 * id: master, customer, entry
 */
router.get('/entries/:id', function (req, res) {

    function getByIdQuery(q, id) {
        let query = Entries.find({ [q]: id })
            .populate('masterId', '-password -ip -addedAt')
            .populate('customerId', '-password -ip -addedAt');
        return query;
    }

    if (req.params && req.params.id) {

        let queryParam = req.query.q;
        if (req.query.q === undefined) queryParam = '_id';
        if (req.query.q === 'master') queryParam = 'masterId';
        if (req.query.q === 'customer') queryParam = 'customerId';

        const query = getByIdQuery(queryParam, req.params.id);

        query.exec(function (err, entry) {
            if (!entry) {
                fmain.sendJSONresponse(res, 404, {
                    message: "Entry(entries) not found"
                });
                return;
                /*             } else if (!entry.length) {
                                fmain.sendJSONresponse(res, 404, {
                                    message: "Entry(entries) not found"
                                });
                                return; */
            } else if (err) {
                fmain.sendJSONresponse(res, 404, err);
                return;
            }
            fmain.sendJSONresponse(res, 200, entry);
        });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id in request"
        });
    }
});

// Modify Entry (Done)
router.put('/entries/:id', fauth.checkAuth, function (req, res) {
    if (req.params && req.params.id && req.user && req.user.role) {

        let entry = {};
        let addressee;
        if (req.user.role === 'master') {
            entry = {
                //date: req.body.date,
                //time: req.body.time,
                status: req.body.status,
                masterComment: req.body.masterComment,
                //customerComment: req.body.customerComment
            };
            addressee = 'customer';
        } else if (req.user.role === 'customer') {
            entry = {
                //date: req.body.date,
                //time: req.body.time,
                status: req.body.status,
                //masterComment: req.body.masterComment,
                customerComment: req.body.customerComment
            };
            addressee = 'master';
        }

        Entries
            .findByIdAndUpdate(req.params.id, entry, { new: true }, function (err, entry) {

                if (!entry) {
                    sendJSONresponse(res, 404, err);
                    return;
                } else if (err) {
                    fmain.sendJSONresponse(res, 500, err);
                    return;
                }

                if (entry.id) {
                    Entries.findById(entry.id)
                        .populate('masterId', '-password -ip -addedAt')
                        .populate('customerId', '-password -ip -addedAt')
                        .exec(function (err, entry) {
                            if (!entry) {
                                fmain.sendJSONresponse(res, 404, {
                                    message: "entries not changed"
                                });
                                return;
                            } else if (err) {
                                fmain.sendJSONresponse(res, 400, err);
                                return;
                            }

                            fmain.sendJSONresponse(res, 200, entry);

                            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                            let emailMsg = {
                                //to: 'beautyshop@mailinator.com',
                                from: 'no-reply@beutyshop.com',
                                //subject: 'Your order status has been changed to ' + entry.status,
                                subject: 'Your order status has been changed',
                                //text: 'Entry on \r\n' + 'date: ' + entry.date + ' time: ' + entry.time + '\r\n'
                                text: 'Entry on: ' + entry.date + ' at ' + entry.time + '\r\n',
                                html: `<p>Entry on: ${entry.date}  at ${entry.time}</p>`
                            };


                            if (addressee === 'master') {
                                emailMsg.to = entry.masterId.email;

                                emailMsg.text += 'Customer name: ' + entry.customerId.name + '\r\n';
                                emailMsg.html += '<p>Customer name: <a href="' + userUrl + entry.customerId.id + '/">' + entry.customerId.name + '<a></p>';

                                emailMsg.text += 'Customer phone number: ' + entry.customerId.phoneNumber + '\r\n';
                                emailMsg.html += '<p>Customer phone number: ' + entry.customerId.phoneNumber + '</p>';

                                emailMsg.text += 'Status has been changed to : ' + entry.status + '\r\n';
                                emailMsg.html += '<p>Status has been changed to : <b>' + entry.status + '</b></p>';

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

                                emailMsg.text += 'Status has been changed to : ' + entry.status + '\r\n';
                                emailMsg.html += '<p>Status has been changed to : <b>' + entry.status + '</b></p>';

                                if (entry.masterComment.length > 0) {
                                    emailMsg.text += 'comment for entry: ' + entry.masterComment;
                                    emailMsg.html += '<p>comment for entry: ' + entry.masterComment + '</p>';
                                }

                            } else {
                                console.log('Email not send');
                                return;
                            }

                            sgMail.send(emailMsg);

                            return;
                        });
                } else {
                    fmain.sendJSONresponse(res, 404, {
                        message: "entries not changed"
                    });
                    return;
                }

            });

    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id in request"
        });
    }

});

// Get Entry(entries) by master id and date (Deprecated)
router.get('/entries/master/:id', function (req, res) {
    if (req.params && req.params.id && req.query && req.query.date) {
        Entries
            .find({ masterId: req.params.id, date: req.query.date })
            .populate('masterId', '-password -ip -addedAt')
            .populate('customerId', '-password -ip -addedAt')
            .exec(function (err, entries) {

                if (!entries) {
                    fmain.sendJSONresponse(res, 404, {
                        message: "Entry(entries) not found"
                    });
                    return;
                    /*                 } else if (!entries.length) {
                                        fmain.sendJSONresponse(res, 404, {
                                            message: "Entry(entries) on this date not found"
                                        });
                                        return; */
                } else if (err) {
                    fmain.sendJSONresponse(res, 404, err);
                    return;
                }

                fmain.sendJSONresponse(res, 200, entries);

            });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id or date in request"
        });
    }
});

// Get Entry(entries) by master or customer id and date (Done)
router.get('/entries/user/:id', function (req, res) {
    if (req.params && req.params.id && req.query && req.query.date) {
        User
            .findById(req.params.id)
            .exec(function (err, user) {
                if (!user) {
                    fmain.sendJSONresponse(res, 404, {
                        message: "User not found"
                    });
                    return;
                } else if (err) {
                    fmain.sendJSONresponse(res, 404, err);
                    return;
                }

                let userId;
                if (user.role === 'master') userId = 'masterId';
                if (user.role === 'customer') userId = 'customerId';

                Entries
                    .find({ [userId]: req.params.id, date: req.query.date })
                    .populate('masterId', '-password -ip -addedAt')
                    .populate('customerId', '-password -ip -addedAt')
                    .exec(function (err, entries) {

                        if (!entries) {
                            fmain.sendJSONresponse(res, 404, {
                                message: "Entry(entries) not found"
                            });
                            return;
                        } else if (err) {
                            fmain.sendJSONresponse(res, 404, err);
                            return;
                        }

                        fmain.sendJSONresponse(res, 200, entries);

                    });
            });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id or date in request"
        });
    }
});

module.exports = router;
