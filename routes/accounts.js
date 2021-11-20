const express = require("express");
const router = express.Router();
const AccountsModel = require("../models/accounts.model");
const AccountBalanceModel = require("../models/accountBalance.model");
const UserModel = require("../models/users.model");

async function findUserById(_id) {
  return await UserModel.findById({ _id });
}

async function confirmReceipt(data) {
  return await AccountsModel.findByIdAndUpdate(
    { _id: data._id },
    { $set: { "payment.confirmReceipt": true } },
    { new: true }
  );
}

async function updateLimit(data) {
  const user = await findUserById(data.userID);
  return await UserModel.findByIdAndUpdate(
    { _id: data.userID },
    {
      $set: {
        limit: user.limit + data.amount,
      },
    },
    { new: true }
  );
}

// Updated Account Due, Balance and Cr. Limit on confirm receipt
router.post("/updateBalance", async (req, res, next) => {
  const { userID, amount } = { ...req.body };
  const user = await AccountBalanceModel.findOne({ userID });
  if (user) {
    const filer = { userID };
    const updateObj =
      user.due >= amount
        ? { $set: { due: user.due - amount, balance: 0 } }
        : { $set: { due: 0, balance: user.balance + (amount - user.due) } };
    const options = { new: true, useFindAndModify: false };

    await AccountBalanceModel.findOneAndUpdate(filer, updateObj, options);
    await confirmReceipt(req.body);
    await updateLimit(req.body);

    res.status(200).send({
      error: "undefind",
      message: "Balance updated succefully.",
    });
  } else {
    const userData = {
      due: 0,
      balance: amount,
      userID,
    };
    await confirmReceipt(req.body);
    const newEnry = new AccountBalanceModel(userData);
    newEnry.save((err, response) => {
      if (err) res.status(400).send({ error: err });
      else
        res
          .status(200)
          .send({ error: undefined, message: "Balance updated succefully." });
    });
  }
});

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
