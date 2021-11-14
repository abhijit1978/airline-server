const express = require("express");
const router = express.Router();
const AccountsModel = require("../models/accounts.model");

//Get Account Transactions of USER
router.post("/statement", async (req, res, next) => {
  const statement = await AccountsModel.find({ userID: req.body.id });
  if (statement.length) {
    res.status(200).send({ statement, error: undefined });
  } else {
    res.status(400).send({ error: "User / Data not found" });
  }
});

// Make payment
router.post("/payment", async (req, res, next) => {
  const data = { ...req.body };
  const paymentData = {
    userID: data.userID,
    transType: "credit",
    payment: {
      bankName: data.bankName,
      branchName: data.bankBranchName,
      transID: data.transactionID,
      amount: data.amount,
    },
  };
  const newEnry = new AccountsModel(paymentData);

  newEnry.save((err, accountData) => {
    if (err) {
      res.status(400).send({
        error: err,
        message: "Transaction failed. Please try again latter",
      });
    } else {
      res
        .status(200)
        .send({ error: undefined, message: "Payment data received." });
    }
  });
});

module.exports = router;
