const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    FeedbackData: {
        type: String,
        required: true
    },
    TimeAdded: {
        type: String
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
