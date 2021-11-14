const mongoose = require("mongoose");

const accountsSchema = mongoose.Schema({
  userID: { type: String, require: true },
  transType: { type: String, require: true },
  transDate: { type: Date, require: true, default: Date.now },
  ticket: {
    ticketID: { type: String, default: "" },
    travelDate: { type: Date, default: "" },
    pnr: { type: String, default: "" },
    totalFare: { type: Number, default: 0 },
  },
  payment: {
    bankName: { type: String, default: "" },
    branchName: { type: String, default: "" },
    transID: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    confirmReceipt: { type: Boolean, default: false },
  },
});

const AccountsModel = mongoose.model("account", accountsSchema);

module.exports = AccountsModel;
