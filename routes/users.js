/**
 * TODO:
 * - создать контролер
 * --------------------
 * - привести в порядок роутер
 *   - добавить проверки всех входных данных
 */

let express = require('express');
let router = express.Router();
let bcrypt = require('bcryptjs');
let User = require('../models/users.models');
require('dotenv').config();
// для защиты от инъекций используем lodash ("вырезает лишнее")
let _ = require('lodash');
let passport = require('passport');
let jwt = require('jsonwebtoken');
let multer = require('multer');
let uniqid = require('uniqid');
let fs = require('fs');

function sendJSONresponse(res, status, content) {
    console.log(status, content);
    res.status(status);
    res.json(content);
}

function compare(a, b) {
    return (a === b);
}

function getIp(req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    return ip.replace(/::ffff:/, '');
}

function checkAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
        if (jwtError != void (0) || err != void (0)) {
            //console.log('err = ', err);
            //console.log('jwtError = ', jwtError);
            sendJSONresponse(res, 403, { error: err || jwtError });
            return;
        }
        req.user = decryptToken;
        next();
    })(req, res, next);
}

function createToken(body) {
    return jwt.sign(
        body,
        process.env.secretOrKey,
        { expiresIn: '1 day' }
    );
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

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/avatars/');
    },

    filename: function (req, file, cb) {
        if (req.params && req.params.id) {
            User
                .findById(_.escapeRegExp(req.params.id))
                .exec(function (err, user) {

                    if (!user) {
                        cb(new Error(err));
                        return;
                    } else if (err) {
                        cb(new Error(err));
                        return;
                    }

                    let ext;
                    file.origFileName = './public/images/avatars/' + user.avatar;

                    let newFileName = uniqid() + Date.now();

                    switch (file.mimetype) {
                        case 'image/jpeg':
                            ext = '.jpg';
                            cb(null, newFileName + ext);
                            break;
                        case 'image/pjpeg':
                            ext = '.pjpeg';
                            cb(null, newFileName + ext);
                            break;
                        case 'image/png':
                            ext = '.png';
                            cb(null, newFileName + ext);
                            break;
                        case 'image/gif':
                            ext = '.gif';
                            cb(null, newFileName + ext);
                            break;
                        default:
                            cb(new Error('You can only upload files with the extension jpg, png, gif'));
                            return;
                    }
                });
        } else {
            cb(new Error('no id in request'));
        }


    }
});

let upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 } // Filesize avatar max. 1 MB
}).single('avatar');

// login user (Done)
router.post('/login', function (req, res) {
    if (req.body && req.body.email && req.body.password) {
        User
            .findOne({ email: { $regex: _.escapeRegExp(req.body.email.toLowerCase()), $options: "i" } }, function (err, user) {
                if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (user && bcrypt.compareSync(req.body.password, user.password) && compare(user.email, req.body.email.toLowerCase())) {
                    let token = createToken({ id: user._id, username: user.name, email: user.email });
                    /*  res.cookie('token', token, {
                        httpOnly: true
                    }); */

                    let userPlusToken = userData(user);
                    userPlusToken.token = token;

                    sendJSONresponse(res, 200, userPlusToken);
                } else {
                    sendJSONresponse(res, 400, {
                        message: "Wrong login or password"
                    });
                    return;
                }
            });
    } else {
        sendJSONresponse(res, 400, {
            "message": "All required fields must be filled"
        });
    }
});

// logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    sendJSONresponse(res, 200, {
        "message": "logout success"
    });
});

// Create user (Done)
router.post('/users', function (req, res) {
    if (req.body && req.body.email && req.body.password && req.body.phoneNumber && req.body.role) {
        User
            .findOne({ email: { $regex: _.escapeRegExp(req.body.email), $options: "i" } }, function (err, user) {
                if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (user) {
                    sendJSONresponse(res, 400, {
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
                        sendJSONresponse(res, 400, err);
                    } else {
                        sendJSONresponse(res, 201, userData(user));
                    }
                });
            });
    } else {
        sendJSONresponse(res, 400, {
            "message": "All required fields must be filled"
        });
    }
});

// Send all users to front (Done)
router.get('/users', function (req, res) {
    User.find({})
        .exec(function (err, users) {
            if (err) {
                sendJSONresponse(res, 404, err);
                return;
            }
            if (users) {
                let usersOut = [];
                users.forEach(element => {
                    usersOut.push(userData(element));
                });
                sendJSONresponse(res, 200, usersOut);
            } else {
                sendJSONresponse(res, 404, {
                    message: "users not found"
                });
            }

        })
});

// Get user by id (Done)
router.get('/users/:id', function (req, res) {
    if (req.params && req.params.id) {
        User
            .findById(_.escapeRegExp(req.params.id))
            .exec(function (err, user) {
                if (!user) {
                    sendJSONresponse(res, 404, {
                        message: "User not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 404, err);
                    return;
                }
                sendJSONresponse(res, 200, userData(user));
            });
    } else {
        sendJSONresponse(res, 404, {
            message: "no id in request"
        });
    }
});

// Modify User (Done)
router.put('/users/:id', checkAuth, function (req, res) {
    if (req.params && req.params.id) {
        upload(req, res, function (err) {
            if (err) {
                sendJSONresponse(res, 500, err);
                return;
            }

            let user = {
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                userInfo: req.body.userInfo,
                password: bcrypt.hashSync(req.body.password, 12)
            }
            console.log(req.file);
            if (req.file) user.avatar = req.file.filename;

            User
                .findByIdAndUpdate(req.params.id, user, { new: true }, function (err, user) {
                    if (!user) {
                        sendJSONresponse(res, 404, err);
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 500, err);
                        return;
                    }

                    if (fs.existsSync(req.file.origFileName)) {
                        fs.unlinkSync(req.file.origFileName, (err) => {
                            if (err) console.log(req.file.origFileName + ' not deleted');
                        });
                    } else {
                        console.log(req.file.origFileName + ' not found');
                    }


                    sendJSONresponse(res, 200, userData(user));

                });
        });
    } else {
        sendJSONresponse(res, 404, {
            message: "no id in request"
        });
    }

});


module.exports = router;
