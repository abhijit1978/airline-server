const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  locationName: { type: String, minlength: 3, maxlength: 100, required: true },
  locationCode: { type: String, minlength: 7, maxlength: 7, required: true },
  srcAirportName: {
    type: String,
    minlength: 10,
    maxlength: 300,
    required: true,
  },
  destAirportName: {
    type: String,
    minlength: 10,
    maxlength: 300,
    required: true,
  },
});

const LocationModel = mongoose.model("location", locationSchema);

module.exports = LocationModel;
