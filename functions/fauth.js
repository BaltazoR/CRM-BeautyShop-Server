let passport = require('passport');
let jwt = require('jsonwebtoken');
let fmain = require('../functions/fmain');

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
