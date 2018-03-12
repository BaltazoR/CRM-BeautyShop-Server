/**
 * TODO:
 * - создать контролер
 * - привести в порядок роутер
 * - добавить проверки на ошибки
 * - добавить ответы для фронтэнда
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

function ExtractJwt(req) {
    let token = null;
    if (req.cookies && req.cookies.token != void (0)) token = req.cookies.token;
    return token;
}


function checkAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
        if (jwtError != void (0) || err != void (0)) return res.render('login', { error: err || jwtError });
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


router.post('/login', function (req, res) {
    User.findOne({ email: { $regex: _.escapeRegExp(req.body.email), $options: "i" } }, function (err, user) {
        if (user != void (0) && bcrypt.compareSync(req.body.password, user.password) && compare(user.email, req.body.email)) {
            let token = createToken({ id: user._id, username: user.name, email: user.email });
            res.cookie('token', token, {
                httpOnly: true
            });

            let userData = {
                _id: user._doc._id,
                name: user._doc.name,
                email: user._doc.email,
                token: token
            };
            res.json(userData);
        } else {
            res.json({ status: 'error' });
        }
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'ok' });
});


router.post('/users', function (req, res) {
    User.findOne({ email: { $regex: _.escapeRegExp(req.body.email), $options: "i" } }, function (err, user) {
        if (user != void (0)) return res.status(400).json({ status: 'error', message: "User already exist" });
        user = User.create({
            email: req.body.email,
            name: req.body.name,
            password: req.body.password,
            ip: getIp(req)
        });

        // let token = createToken({ id: user._id, username: user.name, email: user.email });
        // res.cookie('token', token, {
        //     httpOnly: true
        // });

        res.json({ status: 'ok' });
    });
});


router.get('/users', checkAuth, (req, res, next) => {
    User.find({})
        .then(users => {
            res.json(users);
        })
        .catch(next);
});


module.exports = router;
