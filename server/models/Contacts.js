const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  CREWID: {
    type: String,

},
'CREW NAME': {
    type: String,
    required: true
},
FATHER: {
    type: String
},
GENDER: {
    type: String
},
TRACTION: {
    type: String
},
CADRE: {
  type: String
},
'MOBILE NO': {
  type: String
},
'CREW TYPE': {
  type: String
},
'AVAIL DATE': {
  type: String
},
'EMP CODE': {
  type: String
},
'APP.DATE': {
  type: String
},
DOB: {
  type: String
}
});

module.exports = mongoose.model('Contact', ContactSchema);

