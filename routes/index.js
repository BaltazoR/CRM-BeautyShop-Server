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


router.get('/', checkAuth, function (req, res) {
    res.render('index', { title: 'Авторизированый пользователь', username: req.user.username, email: req.user.email });
});

router.get('/login', checkAuth, function (req, res) {
    res.render('login', { title: 'Войти' });
});

router.post('/login', function (req, res) {
    User.findOne({ email: { $regex: _.escapeRegExp(req.body.email), $options: "i" } }, function (err, user) {
        if (user != void (0) && bcrypt.compareSync(req.body.password, user.password) && compare(user.email, req.body.email)) {
            let token = createToken({ id: user._id, username: user.name, email: user.email });
            res.cookie('token', token, {
                httpOnly: true
            });
            res.redirect('/');
        } else {
            return res.render('error', { message: 'неверный логин или пароль' });
        }
    });

});

router.get('/register', function (req, res) {
    res.render('register', { title: 'Регистрация' });
});

router.post('/register', function (req, res) {
    User.findOne({ email: { $regex: _.escapeRegExp(req.body.email), $options: "i" } }, function (err, user) {
        if (user != void (0)) return res.status(400).render('error', { message: "User already exist" });
        user = User.create({
            email: req.body.email,
            name: req.body.name,
            password: req.body.password,
            ip: getIp(req)
        });

        let token = createToken({ id: user._id, username: user.name, email: user.email });
        res.cookie('token', token, {
            httpOnly: true
        });
        res.render('login', { title: 'Войти' });
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});


module.exports = router;
