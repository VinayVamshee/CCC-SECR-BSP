const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
    Category: {
        type: String,
    },
    TimeAdded: {
        type: String
    }
});

module.exports = mongoose.model('Notice', NoticeSchema);