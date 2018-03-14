/**
 *  Перед npm build нужно сделать папку client для публичных файлов
 */
let express = require('express');
let router = express.Router();


router.get('/', function (req, res) {
    //res.sendStatus(200);
    res.redirect('http://beauty-shop.s3-website.eu-central-1.amazonaws.com/');
});


module.exports = router;
