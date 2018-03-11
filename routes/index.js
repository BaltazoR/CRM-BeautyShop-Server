/**
 *  Перед npm build нужно сделать папку client для публичных файлов
 */
let express = require('express');
let router = express.Router();


router.get('/', function (req, res) {
    res.sendStatus(200);
    //res.redirect('http://ukr.net');
});


module.exports = router;
