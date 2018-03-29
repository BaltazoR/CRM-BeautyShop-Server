/**
 * TODO:
 * - создать контролер
 * - привести в порядок роутер
 */

let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
let User = require('../models/users.models');
require('dotenv').config();
let fs = require('fs');
let fmain = require('../functions/fmain');
let fauth = require('../functions/fauth');
let upload = require('../functions/fupload-ava');
let AWS = require('aws-sdk');

function getIp(req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    return ip.replace(/::ffff:/, '');
}

function userData(user) {
    return user = {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar,
        userInfo: user.userInfo,
    };
}


// login user (Done)
router.post('/login', function (req, res) {
    if (req.body && req.body.email && req.body.password) {
        User
            .findOne({ email: req.body.email.toLowerCase() }, function (err, user) {
                if (err) {
                    fmain.sendJSONresponse(res, 400, err);
                    return;
                }
                if (user && bcrypt.compareSync(req.body.password, user.password) && (user.email === req.body.email.toLowerCase())) {
                    let token = fauth.createToken({
                        id: user._id,
                        role: user.role,
                        username: user.name,
                        email: user.email
                    });
                    /*  res.cookie('token', token, {
                        httpOnly: true
                    }); */

                    let userPlusToken = userData(user);
                    userPlusToken.token = token;

                    fmain.sendJSONresponse(res, 200, userPlusToken);
                } else {
                    fmain.sendJSONresponse(res, 400, {
                        message: "Wrong login or password"
                    });
                    return;
                }
            });
    } else {
        fmain.sendJSONresponse(res, 400, {
            "message": "All required fields must be filled"
        });
    }
});

// logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    fmain.sendJSONresponse(res, 200, {
        "message": "logout success"
    });
});

// Create user (Done)
router.post('/users', function (req, res) {
    if (req.body && req.body.email && req.body.password && req.body.phoneNumber && req.body.role) {
        User
            .findOne({ email: req.body.email }, function (err, user) {
                if (err) {
                    fmain.sendJSONresponse(res, 400, err);
                    return;
                }
                if (user) {
                    fmain.sendJSONresponse(res, 400, {
                        message: "User with email or phone number already exist"
                    });
                    return;
                }
                // Create default avatar
                let avatar = 'def_customer.jpg';
                if (req.body.role === 'master') avatar = 'def_master.jpg';

                user = User.create({
                    email: req.body.email.toLowerCase(),
                    name: req.body.name,
                    password: req.body.password,
                    phoneNumber: req.body.phoneNumber,
                    role: req.body.role,
                    avatar: avatar,
                    ip: getIp(req)
                }, function (err, user) {
                    if (err) {
                        fmain.sendJSONresponse(res, 400, err);
                    } else {
                        fmain.sendJSONresponse(res, 201, userData(user));
                    }
                });
            });
    } else {
        fmain.sendJSONresponse(res, 400, {
            "message": "All required fields must be filled"
        });
    }
});

// Send all users to front (Done)
router.get('/users', function (req, res) {
    User.find({})
        .exec(function (err, users) {
            if (err) {
                fmain.sendJSONresponse(res, 404, err);
                return;
            }
            if (users) {
                let usersOut = [];
                users.forEach(element => {
                    usersOut.push(userData(element));
                });
                fmain.sendJSONresponse(res, 200, usersOut);
            } else {
                fmain.sendJSONresponse(res, 404, {
                    message: "users not found"
                });
            }

        })
});

// Get user by id (Done)
router.get('/users/:id', function (req, res) {
    if (req.params && req.params.id) {
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
                fmain.sendJSONresponse(res, 200, userData(user));
            });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id in request"
        });
    }
});

// Modify User (Done)
router.put('/users/:id', fauth.checkAuth, function (req, res) {
    if (req.params && req.params.id && (req.params.id === req.user.id)) {
        upload(req, res, function (err) {
            if (err) {
                fmain.sendJSONresponse(res, 500, err);
                return;
            }

            let user = {
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                userInfo: req.body.userInfo,
                password: bcrypt.hashSync(req.body.password, 12)
            }


            if (req.file) {
                user.avatar = req.file.filename;
                AWS.config.update({
                    accessKeyId: process.env.accessKeyId,
                    secretAccessKey: process.env.secretAccessKey
                });
                let s3 = new AWS.S3();
                fs.readFile(req.file.path, function (err, data) {
                    if (err) { throw err; }
                    let params = {
                        Bucket: 'aws-avatars',
                        Key: req.file.filename,
                        ACL: 'public-read',
                        ContentType: req.file.mimetype,
                        Body: data
                    };

                    s3.putObject(params, function (err) {
                        if (err) {
                            fmain.sendJSONresponse(res, 500, err);
                            return;
                        } else {
                            console.log('Successfully uploaded "' + req.file.filename + '" to AWS');

                            fs.unlinkSync(req.file.path);

                            User
                                .findByIdAndUpdate(req.params.id, user, { new: true }, function (err, user) {
                                    if (!user) {
                                        fmain.sendJSONresponse(res, 404, err);
                                        return;
                                    } else if (err) {
                                        fmain.sendJSONresponse(res, 500, err);
                                        return;
                                    }


                                    if ((req.file.oldAvaName !== 'def_customer.jpg') && (req.file.oldAvaName !== 'def_master.jpg')) {
                                        AWS.config.update({
                                            accessKeyId: process.env.accessKeyId,
                                            secretAccessKey: process.env.secretAccessKey
                                        });
                                        let s3 = new AWS.S3();
                                        let params_del = {
                                            Bucket: 'aws-avatars',
                                            Delete: {
                                                Objects: [
                                                    {
                                                        Key: req.file.oldAvaName
                                                    }
                                                ],
                                                Quiet: false
                                            }
                                        };

                                        s3.deleteObjects(params_del, function (err, data) {
                                            if (err) {
                                                console.log(err, err.stack);
                                            }else {
                                                let delOldFile = data.Deleted;
                                                console.log('File', delOldFile[0].Key, 'was deleted from AWS');
                                            }
                                        });
                                    }
                                    fmain.sendJSONresponse(res, 200, userData(user));
                                    return;
                                });
                        }
                    });
                });
            } else {
                User
                    .findByIdAndUpdate(req.params.id, user, { new: true }, function (err, user) {
                        if (!user) {
                            fmain.sendJSONresponse(res, 404, err);
                            return;
                        } else if (err) {
                            fmain.sendJSONresponse(res, 500, err);
                            return;
                        }
                        fmain.sendJSONresponse(res, 200, userData(user));
                        return;
                    });
            }
        });
    } else {
        fmain.sendJSONresponse(res, 404, {
            message: "no id in request or bad token"
        });
    }

});


module.exports = router;
