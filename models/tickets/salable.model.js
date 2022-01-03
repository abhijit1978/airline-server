const mongoose = require("mongoose");

const salableTicketSchema = mongoose.Schema({
  pnr: { type: String, require: true, minlength: 3, maxlength: 20 },
  flightNumber: { type: String, require: true, minlength: 3, maxlength: 10 },
  airlineName: { type: String, require: true, minlength: 3, maxlength: 50 },
  airlineID: { type: String, require: true, minlength: 3, maxlength: 50 },
  location: {
    locationName: { type: String, require: true, minlength: 3, maxlength: 50 },
    locationCode: { type: String, require: true, minlength: 3, maxlength: 50 },
  },
  travelDate: { type: Date, require: true },
  departureTime: { type: String, require: true },
  arrivalTime: { type: String, require: true },
  salable: {
    startDate: { type: Date, require: true },
    endDate: { type: Date, require: true },
    qty: { type: Number, require: true, minlength: 1 },
    salePrice: { type: Number, require: true, minlength: 3 },
  },
});

const SalableTicketModel = mongoose.model("salableTicket", salableTicketSchema);

module.exports = SalableTicketModel;
