const mongoose = require('mongoose');

const VideoCategorySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('VideoCategory', VideoCategorySchema);
