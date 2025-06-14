const mongoose = require('mongoose');

const StaffUserSchema = new mongoose.Schema({
    Staffusername: {
        type: String,
        required: true,
    },
    Staffpassword: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('StaffUser', StaffUserSchema);