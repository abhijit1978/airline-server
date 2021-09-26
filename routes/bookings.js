const express = require("express");
const router = express.Router();
const BookTicketModel = require("../models/tickets/booking.model");
const SalableTicketModel = require("../models/tickets/salable.model");
const Moment = require("moment");

async function validate(data) {
  let valid = false;
  const salableTicket = await getSalable(data.travel.pnr);
  const salableQty = salableTicket.length ? salableTicket[0].salable.qty : 0;

  if (salableQty >= data.fareDetails.bookQty) {
    valid = true;
  }
  console.log(data);
  return valid;
}

async function getSalable(pnr) {
  return await SalableTicketModel.find({ pnr });
}

router.post("/", async (req, res, next) => {
  const data = req.body;
  const isValid = await validate(data);
  if (isValid) {
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
    res.status(400).send("Not valid request.");
  }
});

module.exports = router;
