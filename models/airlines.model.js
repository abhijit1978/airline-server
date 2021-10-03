const mongoose = require("mongoose");

const airlineSchema = mongoose.Schema({
  airlineName: { type: String, minlength: 3, maxlength: 50 },
  airlineCode: { type: String, minlength: 2, maxlength: 10 },
  alias: { type: String, minlength: 2, maxlength: 20 },
  airlineLogo: { type: String, default: "noimg" },
});

const AirlineModel = mongoose.model("airline", airlineSchema);

module.exports = AirlineModel;
