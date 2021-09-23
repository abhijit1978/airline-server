const mongoose = require("mongoose");

const bookTicketSchema = mongoose.Schema({
  travel: {
    airlineName: { type: String, require: true, minlength: 3, maxlength: 50 },
    flightNumber: { type: String, require: true, minlength: 3, maxlength: 10 },
    location: {
      locationCode: {
        type: String,
        require: true,
        minlength: 3,
        maxlength: 50,
      },
      locationName: {
        type: String,
        require: true,
        minlength: 3,
        maxlength: 50,
      },
    },
    travelDate: { type: Date, require: true },
    departureTime: { type: String, require: true },
    arrivalTime: { type: String, require: true },
    pnr: { type: String, require: true, minlength: 3, maxlength: 20 },
  },
  passenger: {
    passengers: { type: Array, require: true },
    contacts: {
      mobile: { type: Number, require: true, minlength: 10, maxlength: 10 },
      email: { type: String, require: true },
    },
  },
  fareDetails: {
    bookQty: { type: Number, require: true },
    rate: { type: Number, require: true },
    otherCharges: { type: Number },
    infantCharges: { type: Number },
    totalFare: { type: Number, require: true },
  },
  agent: {
    agentName: {
      firstName: { type: String, require: true, minlength: 3, maxlength: 50 },
      lastName: { type: String, require: true, minlength: 1, maxlength: 50 },
      middleName: { type: String },
    },
    agentID: { type: String, require: true, minlength: 3, maxlength: 50 },
    id: { type: String, require: true, minlength: 3, maxlength: 50 },
    email: { type: String, require: true, minlength: 3, maxlength: 50 },
    bookingDate: { type: Date, require: true },
  },
});

const BookTicketModel = mongoose.model("ticket", bookTicketSchema);

module.exports = BookTicketModel;
