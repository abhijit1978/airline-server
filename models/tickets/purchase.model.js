const mongoose = require("mongoose");

const purchaseSchema = mongoose.Schema({
  airlineName: { type: String, require: true, minlength: 3, maxlength: 50 },
  airlineID: { type: String, require: true, minlength: 3, maxlength: 50 },
  flightNumber: { type: String, require: true, minlength: 3, maxlength: 10 },
  location: { type: String, require: true, minlength: 3, maxlength: 50 },
  travelDate: { type: Date, require: true },
  departureTime: { type: String, require: true },
  arrivalTime: { type: String, require: true },
  pnr: { type: String, require: true, minlength: 3, maxlength: 20 },
  purchasePrice: { type: Number, require: true },
  ticketsQty: { type: Number, require: true },
  userId: { type: String, require: true },
  datePurchased: { type: Date, require: true, default: Date.now },
});

const PurchaseModel = mongoose.model("ticket", purchaseSchema);

module.exports = PurchaseModel;
