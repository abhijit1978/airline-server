const express = require("express");
const router = express.Router();
const PurchaseModel = require("../models/tickets/purchase.model");
const SalableTicketModel = require("../models/tickets/salable.model");
const StockModel = require("../models/tickets/stock.model");
const Moment = require("moment");

// Find all tickets, sorted on Travel Date
async function getTickets(paramsObj) {
  const params = {};
  for (key in paramsObj) {
    if (paramsObj[key]) params[key] = paramsObj[key];
  }
  return await PurchaseModel.find(params).sort({ travelDate: -1 });
}

async function getStocks() {
  return await StockModel.find();
}

async function getSalableTickets(paramsObj) {
  const params = {
    "salable.startDate": { $lte: Moment().format("YYYY-MM-DD") },
    "salable.endDate": { $gte: Moment().format("YYYY-MM-DD") },
    "salable.qty": { $gte: 1 },
  };
  for (key in paramsObj) {
    if (key === "locationCode") {
      params["location.locationCode"] = paramsObj.locationCode;
    }
    if (
      key === "travelDate" &&
      paramsObj[key] !== "Invalid date" &&
      paramsObj[key]
    ) {
      params["travelDate"] = paramsObj.travelDate ? paramsObj.travelDate : "";
    }
  }
  return await SalableTicketModel.find(params).sort({
    travelDate: 1,
    departureTime: 1,
  });
}

async function findTickets(pnr) {
  return await PurchaseModel.find({ pnr });
}

async function findInSalable(data) {
  const ticket = await SalableTicketModel.find({ pnr: data.pnr });
  if (ticket) {
    const salable = {
      startDate: data.startDate,
      endDate: data.endDate,
      qty: data.qty,
      salePrice: data.salePrice,
    };
    return SalableTicketModel.findOneAndUpdate(
      { pnr: data.pnr },
      { $set: { salable } },
      { new: true }
    );
  } else {
    return false;
  }
}

async function isSalable(startDate, endDate, pnr, qty) {
  const ticket = await PurchaseModel.find({ pnr });

  if (new Date(ticket[0].travelDate) >= new Date(startDate)) {
    const stock = await StockModel.find({ pnr });

    if (stock[0].inHand >= qty) {
      return {
        found: true,
        ticket,
        stock,
      };
    } else {
      return {
        found: false,
        message: "Invalid ticket as qty not in range",
      };
    }
  } else {
    return {
      found: false,
      message: "Invalid ticket as date not in range",
    };
  }
}

// Route - Get all Tickets
router.post("/", async function (req, res, next) {
  const tickets = await getTickets(req.body);
  const stocks = await getStocks();

  const ticketsWithStock = [];
  tickets.forEach((element) => {
    const stock = stocks.find((item) => item.pnr === element.pnr);
    ticketsWithStock.push({ ...element._doc, stock });
  });

  res.status(200).send(ticketsWithStock);
});

// Route - Get all salable Tickets for Ticket Search
router.post("/getsalable", async function (req, res, next) {
  const tickets = await getSalableTickets(req.body);
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

// Route - Allow to sale ticket
router.post("/salable", async (req, res, next) => {
  const alreadySalableAndUpdated = await findInSalable(req.body);

  if (alreadySalableAndUpdated) {
    res.status(200).send("Updated Successfully");
  } else {
    const { startDate, endDate, pnr, qty } = { ...req.body };
    const ticket = await isSalable(startDate, endDate, pnr, qty);
    if (ticket.found) {
      const newTicket = new SalableTicketModel({
        pnr: req.body.pnr,
        flightNumber: req.body.flightNumber,
        airlineName: req.body.airlineName,
        location: {
          locationName: req.body.locationName,
          locationCode: req.body.locationCode,
        },
        travelDate: req.body.travelDate,
        departureTime: req.body.departureTime,
        arrivalTime: req.body.arrivalTime,
        salable: {
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          qty: req.body.qty,
          salePrice: req.body.salePrice,
        },
      });

      newTicket.save((err) => {
        if (err) {
          res.send({ erroMessage: "Some error", status: 500, error: err });
        } else {
          res.status(200).send({ message: "Sale is allowed for this ticket" });
        }
      });
    } else {
      res.status(400).send(ticket.message);
    }
  }
});

module.exports = router;
