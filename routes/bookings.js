const express = require("express");
const router = express.Router();
const BookTicketModel = require("../models/tickets/booking.model");
const SalableTicketModel = require("../models/tickets/salable.model");
const StockModel = require("../models/tickets/stock.model");
const UserModel = require("../models/users.model");
const AccountsModel = require("../models/accounts.model");
const Moment = require("moment");

let oldLimit = 0;

async function validate(data) {
  let valid = false;

  const salableTicket = await getSalable(data.travel.pnr);
  const salableQty = salableTicket.length ? salableTicket[0].salable.qty : 0;
  const user = await findUserById(data.agent.id);
  oldLimit = user.limit;
  const rate = data.fareDetails.rate;

  if (
    salableQty >= data.fareDetails.bookQty &&
    salableTicket[0].salable.salePrice === rate &&
    oldLimit >= rate * data.fareDetails.bookQty
  ) {
    valid = true;
  }
  return valid;
}

async function getSalable(pnr) {
  return await SalableTicketModel.find({ pnr });
}

async function findUserById(id) {
  return await UserModel.findById({ _id: id });
}

async function updateLimit(data) {
  const userId = data.agent.id;
  const newLimit = oldLimit - data.fareDetails.rate * data.fareDetails.bookQty;
  return await UserModel.findByIdAndUpdate(
    { _id: userId },
    { $set: { limit: newLimit } },
    { new: true }
  );
}

async function getAllBookedTickets(data) {
  if (!data.agentId) {
    return await BookTicketModel.find().sort({ "agent.bookingDate": -1 });
  } else {
    return await BookTicketModel.find({ "agent.id": data.agentId }).sort({
      "agent.bookingDate": -1,
    });
  }
}

async function getTicketStock(pnr) {
  return await StockModel.find({ pnr });
}

async function updateStock(data) {
  const stocks = await getTicketStock(data.travel.pnr);
  const stock = stocks[0]["_doc"];
  await StockModel.findOneAndUpdate(
    { pnr: data.travel.pnr },
    {
      $set: {
        booked: stock.booked + data.fareDetails.bookQty,
        inHand: stock.inHand - data.fareDetails.bookQty,
      },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  );
}

async function updateSalableTicket(data) {
  const tickets = await getSalable(data.travel.pnr);
  const ticket = tickets[0]["_doc"];
  await SalableTicketModel.findOneAndUpdate(
    { pnr: data.travel.pnr },
    { $set: { "salable.qty": ticket.salable.qty - data.fareDetails.bookQty } },
    {
      new: true,
      useFindAndModify: false,
    }
  );
}

function isValidSaleData(data) {
  const isValid = true;
  for (key in data) {
    if (!data[key]) {
      isValid = false;
    }
  }
  return isValid;
}

async function confirmSale(data) {
  const tickets = await BookTicketModel.findById(data.id);
  if (tickets.length) {
    return "Id not found";
  } else {
    return await BookTicketModel.findByIdAndUpdate(
      { _id: data.id },
      {
        $set: { action: { saleReff: data.saleReff, saleDate: data.saleDate } },
      },
      { new: true }
    );
  }
}

async function getTecketID(data) {
  const { firstName, lastName } = { ...data.agent.agentName };
  const totalTickets = await BookTicketModel.find({
    "agent.id": data.agent.id,
  });
  const ticketsCount = totalTickets.length;
  const stringified = ticketsCount.toString();

  let ticketID = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  if (stringified.length < 5) {
    return ticketID.concat(stringified.padStart(5, "0"));
  } else {
    return ticketID.concat(stringified);
  }
}

async function newDebitTransaction(data, ticketID) {
  const totalFare =
    parseInt(data.fareDetails.bookQty) * parseInt(data.fareDetails.rate) +
    parseInt(data.fareDetails.infantCharges);
  const accountData = {
    userID: data.agent.id,
    transType: "debit",
    ticket: {
      ticketID,
      travelDate: data.agent.travelDate,
      pnr: data.travel.pnr,
      totalFare,
    },
  };
  const newEnry = new AccountsModel(accountData);
  newEnry.save((err, accountData) => {
    if (err) console.log(err);
    else console.log(accountData);
  });
}

router.post("/", async (req, res, next) => {
  const data = { ...req.body };
  const isValid = await validate(data);
  if (isValid) {
    await updateSalableTicket(data);
    await updateStock(data);
    await updateLimit(data);
    const ticketID = await getTecketID(data);
    data.ticketID = ticketID;
    const newBooking = new BookTicketModel({ ...data });
    newBooking.save((err, newBooking) => {
      if (err) {
        res.status(400).send({ error: err });
      } else {
        res.status(200).send({
          message: "Ticket added successfully",
          data: newBooking,
          error: "undefined",
        });
      }
    });
    await newDebitTransaction(data, ticketID);
  } else {
    res.status(400).send({
      error:
        "Requested ticket Quantity or Rate mismatch. Please back to Ticket booking page and try again.",
    });
  }
});

router.post("/getBookedTickets", async (req, res, next) => {
  const allBookedTickets = await getAllBookedTickets(req.body);
  res.status(200).send(allBookedTickets);
});

router.post("/confirmSale", async (req, res, next) => {
  if (isValidSaleData()) {
    const soldTicket = await confirmSale(req.body);
    if (soldTicket) {
      res.status(200).send({ message: "Sale confirmed.", error: undefined });
    } else {
      res.status(400).send({ message: "Some error", error: true });
    }
  }
});

module.exports = router;
