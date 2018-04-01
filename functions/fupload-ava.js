let multer = require('multer');
let uniqid = require('uniqid');
let User = require('../models/users.models');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //cb(null, './public/images/avatars/');
        cb(null, './ava_temp_folder/');
    },

    filename: function (req, file, cb) {
        if (req.params && req.params.id) {
            User
                .findById(req.params.id)
                .exec(function (err, user) {

                    if (!user) {
                        cb(new Error(err));
                        return;
                    } else if (err) {
                        cb(new Error(err));
                        return;
                    }

                    let ext;
                    file.oldAvaName = user.avatar;

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

module.exports = upload;
