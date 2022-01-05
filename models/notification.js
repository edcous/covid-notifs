var mongoose = require("mongoose");

var notifSchema = new mongoose.Schema({
  phoneNumber: {
    type: Number
  },
  testID: {
    type: String
  }
});

module.exports = mongoose.model('Notification', notifSchema)
