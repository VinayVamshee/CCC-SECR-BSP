const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema({
  userId: String, 
  token: String, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FcmToken", fcmTokenSchema);
