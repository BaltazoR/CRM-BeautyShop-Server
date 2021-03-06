let mongoose = require('mongoose');

let pushSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
        //unique: true
    },
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String
    }
});

module.exports = mongoose.model('Push', pushSchema);
