var mongoose = require("mongoose");

var typeSchema = new mongoose.Schema({
  typeName: {
    type: String
  },
});

module.exports = mongoose.model('testType', typeSchema)
