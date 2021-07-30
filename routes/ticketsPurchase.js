const express = require("express");
const router = express.Router();
const TicketsPurchaseModel = require("../models/ticket.purchase.model");

async function getTickets() {
  return await TicketsPurchaseModel.find().sort({ travelDate: 1 });
}

async function findTickets(pnr) {
  return await TicketsPurchaseModel.find({ pnr });
}

router.get("/", async function (req, res, next) {
  const tickets = await getTickets();

  res.status(200).send({
    data: tickets,
    message: `Total tickets retrieved ${tickets.length}`,
  });
});

router.post("/", async (req, res, next) => {
  const isTicketExist = await findTickets(req.body.pnr);
  const {
    airlineName,
    flightNumber,
    locationFrom,
    locationTo,
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
    locationFrom,
    locationTo,
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
      res.status(200).send({
        successMessage: "Ticket added successfully",
        data: newTicket,
      });
    });
  } else {
    res.status(400).send({
      errorMessage: "PNR already exists",
    });
  }
});

module.exports = router;
