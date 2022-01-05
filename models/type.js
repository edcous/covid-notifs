var mongoose = require("mongoose");

var typeSchema = new mongoose.Schema({
  testName: {
    type: String
  },
});

module.exports = mongoose.model('Type', typeSchema)
