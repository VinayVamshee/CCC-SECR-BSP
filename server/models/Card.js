const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    Image: {
        type: String,
        required: true,
    },
    Description: {
        type: String
    },
    Link: {
        type: String
    }
});

module.exports = mongoose.model('Card', CardSchema);