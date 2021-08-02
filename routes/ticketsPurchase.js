const express = require("express");
const router = express.Router();
const TicketsPurchaseModel = require("../models/ticket.purchase.model");

async function getTickets() {
  return await TicketsPurchaseModel.find().sort({ travelDate: -1 });
}

async function findTickets(pnr) {
  return await TicketsPurchaseModel.find({ pnr });
}

// Get all Tickets
router.get("/", async function (req, res, next) {
  const tickets = await getTickets();

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
