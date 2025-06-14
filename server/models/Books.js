const mongoose = require('mongoose');

const BooksSchema = new mongoose.Schema({
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
    ClusterName: {
        type: String
    },
    ClusterLink: {
        type: String
    },
    TimeAdded: {
        type: String
    }
});

module.exports = mongoose.model('Book', BooksSchema);
