let passport = require('passport');
let jwt = require('jsonwebtoken');
let fmain = require('../functions/fmain');

module.exports.ExtractJwt = function (req) {
    let token = null;
    //if (req.cookies && req.cookies.token != void (0)) token = req.cookies.token;
    //if (req.body && req.body.token != void (0)) token = req.body.token;
    if (req.get('Authorization') != void (0)) token = req.get('Authorization');
    // slice 'Bearer '
    if (token !== null) token = token.slice(7);
    return token;
}

module.exports.checkAuth = function (req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
        if (jwtError != void (0) || err != void (0)) {
            //console.log('err = ', err);
            //console.log('jwtError = ', jwtError);
            fmain.sendJSONresponse(res, 403, { error: err || jwtError });
            return;
        }
        req.user = decryptToken;
        next();
    })(req, res, next);
}

module.exports.createToken = function (body) {
    return jwt.sign(
        body,
        process.env.secretOrKey,
        { expiresIn: '1 day' }
    );
}

module.exports.createRecoveryToken = function (body) {
    return jwt.sign(
        body,
        process.env.secretOrKey,
        { expiresIn: 60*5 }
    );
}

/* module.exports.parseJwt = function (token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(Buffer.from(base64, 'base64'));
} */
