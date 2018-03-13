let express = require('express');
let path = require('path');
require('dotenv').config();
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let passport = require('passport');
let { Strategy } = require('passport-jwt');


function ExtractJwt(req) {
    let token = null;
    if (req.cookies && req.cookies.token != void (0)) token = req.cookies.token;
    return token;
}

let jwt = {
    jwtFromRequest: ExtractJwt,
    secretOrKey: process.env.secretOrKey
};

passport.use(new Strategy(jwt, function (jwt_payload, done) {
    if (jwt_payload != void (0)) return done(false, jwt_payload);
    done();
}));

require('./models/db');

let index = require('./routes/index');
let users = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Dev fix for front-end
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    /* let allowedOrigins = ['http://localhost:4200 ', 'https://s3.eu-central-1.amazonaws.com', 'https://s3.eu-central-1.amazonaws.com/crm-beauty-shop'];
    let origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } */

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

app.use('/', index);
app.use('/api', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
