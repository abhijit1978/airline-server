const express = require("express");
const router = express.Router();
const BookTicketModel = require("../models/tickets/booking.model");
const SalableTicketModel = require("../models/tickets/salable.model");
const StockModel = require("../models/tickets/stock.model");
const Moment = require("moment");

async function validate(data) {
  let valid = false;
  const salableTicket = await getSalable(data.travel.pnr);
  const salableQty = salableTicket.length ? salableTicket[0].salable.qty : 0;

  if (salableQty >= data.fareDetails.bookQty) {
    valid = true;
  }
  return valid;
}

async function getSalable(pnr) {
  return await SalableTicketModel.find({ pnr });
}

async function getAllBookedTickets(data) {
  console.log(data);
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
    }
  );
}

async function updateSalableTicket(data) {
  const tickets = await getSalable(data.travel.pnr);
  const ticket = tickets[0]["_doc"];
  await SalableTicketModel.findOneAndUpdate(
    { pnr: data.travel.pnr },
    { $set: { "salable.qty": ticket.salable.qty - data.fareDetails.bookQty } }
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

router.post("/", async (req, res, next) => {
  const data = req.body;
  const isValid = await validate(data);
  if (isValid) {
    await updateSalableTicket(data);
    await updateStock(data);
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
  } else {
    res.status(400).send({ error: "Requested ticket quantity not available." });
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
