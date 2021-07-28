const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  locationName: { type: String, minlength: 3, maxlength: 50 },
  locationCode: { type: String, minlength: 3, maxlength: 4 },
  airportName: { type: String, minlength: 3, maxlength: 100 },
});

const LocationModel = mongoose.model("location", locationSchema);

module.exports = LocationModel;
