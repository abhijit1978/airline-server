const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  locationName: String,
  locationCode: String,
  airportName: String,
});

const LocationModel = mongoose.model("location", locationSchema);

module.exports = LocationModel;
