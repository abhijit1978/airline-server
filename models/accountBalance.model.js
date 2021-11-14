const mongoose = require("mongoose");

const AccountBalanceSchema = mongoose.Schema({
  due: { type: Number, require: true, default: 0 },
  balance: { type: Number, require: true, default: 0 },
  userID: { type: String, require: true },
});

const AccountBalanceModel = mongoose.model("acctBalance", AccountBalanceSchema);

module.exports = AccountBalanceModel;
