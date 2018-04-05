let mongoose = require('mongoose');


let entriesSchema = new mongoose.Schema({
    masterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'UsersModel',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'UsersModel',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    masterComment: {
        type: String,
        default: ''
    },
    customerComment: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['New', 'Accepted', 'Completed', 'Rejected'],
        default: 'New',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EntriesModel', entriesSchema);
