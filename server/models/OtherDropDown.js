const mongoose = require('mongoose');

const OtherDropDownSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Link: {
        type: String,
        required: true
    }
});
module.exports = mongoose.model('OtherDropDown', OtherDropDownSchema);