const mongoose = require("mongoose");

const stockSchema = mongoose.Schema({
  pnr: { type: String, require: true, minlength: 3, maxlength: 20 },
  inHand: { type: Number },
  booked: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
});

const StockModel = mongoose.model("stock", stockSchema);

module.exports = StockModel;
