var mongoose = require("mongoose");

var notifSchema = new mongoose.Schema({
  phoneNumber: {
    type: Number
  },
  testID: {
    type: String
  },
  sent:{
    type: Boolean,
    default: false
  }
}, { collection: 'notifications2' });

module.exports = mongoose.model('Notification', notifSchema)
