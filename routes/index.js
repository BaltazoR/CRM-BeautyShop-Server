/**
 *  Перед npm build нужно сделать папку client для публичных файлов
 */
let express = require('express');
let router = express.Router();


router.get('/', function (req, res) {
    res.sendFile('build/index.html');
});


module.exports = router;
