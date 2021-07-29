const mongoose = require("mongoose");

const airlineSchema = mongoose.Schema({
  airlineName: { type: String, minlength: 3, maxlength: 50 },
  airlineCode: { type: String, minlength: 3, maxlength: 10 },
  imgurl: { type: String, maxlength: 100 },
});

const AirlineModel = mongoose.model("airline", airlineSchema);

module.exports = AirlineModel;
