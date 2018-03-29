let express = require('express');
let router = express.Router();
//let User = require('../models/users.models');
let Entries = require('../models/entries.models');
//require('dotenv').config();
//let passport = require('passport');
//let jwt = require('jsonwebtoken');
let fmain = require('../functions/fmain');


// Create entry (Done)
router.post('/entries', function (req, res) {
    if (req.body && req.body.masterId && req.body.customerId && req.body.date && req.body.time) {
        entry = Entries.create({
            masterId: req.body.masterId,
            customerId: req.body.customerId,
            date: req.body.date,
            time: req.body.time,
            masterComment: req.body.masterComment,
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
        if (req.query.q === 'masters') queryParam = 'masterId';
        if (req.query.q === 'customers') queryParam = 'customerId';

        const query = getByIdQuery(queryParam, req.params.id);

        query.exec(function (err, entry) {
            if (!entry) {
                fmain.sendJSONresponse(res, 404, {
                    message: "Entry(entries) not found"
                });
                return;
            } else if (!entry.length) {
                fmain.sendJSONresponse(res, 404, {
                    message: "Entry(entries) not found"
                });
                return;
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

// Modify Entry
// TODO: add check token + role
router.put('/entries/:id', function (req, res) {

    if (req.params && req.params.id) {
        let entry = {
            date: req.body.date,
            time: req.body.time,
            status: req.body.status,
            masterComment: req.body.masterComment,
            customerComment: req.body.customerComment
        };

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

// Get Entry(entries) by master id and date (Done)
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
                } else if (!entries.length) {
                    fmain.sendJSONresponse(res, 404, {
                        message: "Entry(entries) on this date not found"
                    });
                    return;
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

module.exports = router;