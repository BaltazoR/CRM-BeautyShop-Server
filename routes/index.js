/**
 *  Перед npm build нужно сделать папку client для публичных файлов
 */
let express = require('express');
let router = express.Router();


router.get('/', function (req, res) {
    //res.sendStatus(200);
    res.redirect('https://s3.eu-central-1.amazonaws.com/beauty-shop/index.html');
});


module.exports = router;
