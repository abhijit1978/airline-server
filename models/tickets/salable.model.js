const mongoose = require("mongoose");

const salableTicketSchema = mongoose.Schema({
  pnr: { type: String, require: true, minlength: 3, maxlength: 20 },
  flightNumber: { type: String, require: true, minlength: 3, maxlength: 10 },
  airlineName: { type: String, require: true, minlength: 3, maxlength: 50 },
  location: { type: String, require: true, minlength: 3, maxlength: 50 },
  travelDate: { type: Date, require: true },
  departureTime: { type: String, require: true },
  arrivalTime: { type: String, require: true },
  salableTickets: { type: Number, require: true, minlength: 1 },
  startDateToSale: { type: Date, require: true },
  salePrice: { type: Number, require: true, minlength: 3 },
});

const SalableTicketModel = mongoose.model("salableTicket", salableTicketSchema);

module.exports = SalableTicketModel;
