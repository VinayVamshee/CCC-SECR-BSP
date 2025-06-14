const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Link: {
        type: String,
        required: true
    },
    Category: {
        type: String
    },
    TimeAdded: {
        type: String
    }
});

module.exports = mongoose.model('Video', VideoSchema);
