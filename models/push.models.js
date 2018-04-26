let mongoose = require('mongoose');

let pushSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String
    }
});

module.exports = mongoose.model('Push', pushSchema);
