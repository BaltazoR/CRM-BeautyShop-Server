let express = require('express');
let router = express.Router();
//let User = require('../models/users.models');
let Entries = require('../models/entries.models');
//require('dotenv').config();
//let passport = require('passport');
//let jwt = require('jsonwebtoken');
let fmain = require('../functions/fmain');


// Create Entrie (Done)
router.post('/entries', function (req, res) {
    if (req.body && req.body.masterId && req.body.customerId && req.body.date && req.body.time) {
        entrie = Entries.create({
            masterId: req.body.masterId,
            customerId: req.body.customerId,
            date: req.body.date,
            time: req.body.time,
            masterComment: req.body.masterComment,
            customerComment: req.body.customerComment
        }, function (err, entrie) {
            if (err) {
                fmain.sendJSONresponse(res, 400, err);
            } else {
                if (entrie.id) {
                    Entries.findById(entrie.id)
                        .populate('masterId', '-password -ip -addedAt')
                        .populate('customerId', '-password -ip -addedAt')
                        .exec(function (err, entrie) {
                            if (!entrie) {
                                fmain.sendJSONresponse(res, 404, {
                                    message: "entries not create"
                                });
                                return;
                            } else if (err) {
                                fmain.sendJSONresponse(res, 400, err);
                                return;
                            }
                            fmain.sendJSONresponse(res, 201, entrie);
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

/** Get Entrie(s) by id (Done)
 * id: master, customer, entrie
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

        query.exec(function (err, entrie) {
            if (!entrie) {
                fmain.sendJSONresponse(res, 404, {
                    message: "Entrie(s) not found"
                });
                return;
            } else if (!entrie.length) {
                fmain.sendJSONresponse(res, 404, {
                    message: "Entrie(s) not found"
                });
                return;
            } else if (err) {
                fmain.sendJSONresponse(res, 404, err);
                return;
            }
            fmain.sendJSONresponse(res, 200, entrie);
        });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id in request"
        });
    }
});

// Modify Entrie
// TODO: add check token + role
router.put('/entries/:id', function (req, res) {

    if (req.params && req.params.id) {
        let entrie = {
            date: req.body.date,
            time: req.body.time,
            status: req.body.status,
            masterComment: req.body.masterComment,
            customerComment: req.body.customerComment
        };

        Entries
            .findByIdAndUpdate(req.params.id, entrie, { new: true }, function (err, entrie) {

                if (!entrie) {
                    sendJSONresponse(res, 404, err);
                    return;
                } else if (err) {
                    fmain.sendJSONresponse(res, 500, err);
                    return;
                }

                if (entrie.id) {
                    Entries.findById(entrie.id)
                        .populate('masterId', '-password -ip -addedAt')
                        .populate('customerId', '-password -ip -addedAt')
                        .exec(function (err, entrie) {
                            if (!entrie) {
                                fmain.sendJSONresponse(res, 404, {
                                    message: "entries not changed"
                                });
                                return;
                            } else if (err) {
                                fmain.sendJSONresponse(res, 400, err);
                                return;
                            }
                            fmain.sendJSONresponse(res, 200, entrie);
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


module.exports = router;
