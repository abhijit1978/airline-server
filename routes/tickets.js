const express = require("express");
const router = express.Router();
const moment = require("moment");
const TicketsPurchaseModel = require("../models/ticket.purchase.model");

async function getTickets(paramsObj) {
  const params = {
    travelDate: {
      $gt: new Date(),
    },
  };
  for (key in paramsObj) {
    if (paramsObj[key]) params[key] = paramsObj[key];
  }
  return await TicketsPurchaseModel.find(params).sort({ travelDate: 1 });
}

async function findTickets(pnr) {
  return await TicketsPurchaseModel.find({ pnr });
}

// Get all Tickets
router.post("/", async function (req, res, next) {
  const paramsObj = ({ airlineName, location } = { ...req.body });
  const tickets = await getTickets(paramsObj);
  res.status(200).send(tickets);
});

// Add new ticket
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
  const newTicket = new TicketsPurchaseModel({
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

  if (!isTicketExist.length) {
    newTicket.save((err, newTicket) => {
      if (err) res.send({ erroMessage: "Some error", status: 500, error: err });
      res.status(200).send({ message: "Ticket added successfully" });
    });
  } else {
    res.status(400).send({
      errorMessage: "PNR already exists",
    });
  }
});

module.exports = router;
