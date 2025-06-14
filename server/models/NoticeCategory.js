const mongoose = require('mongoose');

const NoticeCategorySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('NoticeCategory', NoticeCategorySchema);
