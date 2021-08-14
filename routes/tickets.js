const express = require("express");
const router = express.Router();
const PurchaseModel = require("../models/tickets/purchase.model");
const StockModel = require("../models/tickets/stock.model");

// Find all tickets, sorted on Travel Date
async function getTickets(paramsObj) {
  const params = {
    travelDate: {
      $gt: new Date(),
    },
  };
  for (key in paramsObj) {
    if (paramsObj[key]) params[key] = paramsObj[key];
  }
  return await PurchaseModel.find(params).sort({ travelDate: 1 });
}

async function findTickets(pnr) {
  return await PurchaseModel.find({ pnr });
}

// Route - Get all Tickets
router.post("/", async function (req, res, next) {
  const paramsObj = ({ airlineName, location } = { ...req.body });
  const tickets = await getTickets(paramsObj);
  res.status(200).send(tickets);
});

// Route - Add new ticket
router.post("/purchase", async (req, res, next) => {
  const isTicketExist = await findTickets(req.body.pnr);
  const {
    airlineName,
    flightNumber,
    location,
    travelDate,
    departureTime,
    arrivalTime,
    pnr,
    purchasePrice,
    ticketsQty,
    userId,
  } = { ...req.body };
  const newTicket = new PurchaseModel({
    airlineName,
    flightNumber,
    location,
    travelDate,
    departureTime,
    arrivalTime,
    pnr,
    purchasePrice,
    ticketsQty,
    userId,
  });

  const newStock = new StockModel({
    pnr,
    inHand: ticketsQty,
  });

  if (!isTicketExist.length) {
    // Purchase Entry
    newTicket.save((err) => {
      if (err) {
        res.send({ erroMessage: "Some error", status: 500, error: err });
      } else {
        res.status(200).send({ message: "Ticket added successfully" });
      }
    });

    // Stock Update
    newStock.save();
  } else {
    res.status(400).send("PNR already exists");
  }
});

module.exports = router;
