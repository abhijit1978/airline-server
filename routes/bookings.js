const express = require("express");
const router = express.Router();
const BookTicketModel = require("../models/tickets/booking.model");
const SalableTicketModel = require("../models/tickets/salable.model");
const StockModel = require("../models/tickets/stock.model");
const UserModel = require("../models/users.model");
const AccountsModel = require("../models/accounts.model");
const AccountBalanceModel = require("../models/accountBalance.model");
const moment = require("moment");

// =============== Mail function
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  REDIRECT_URI,
} = require("../configs/dev.config");

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(data) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "barkat.travel@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "Barkat Tours and Travels <barkat.travel@gmail.com>",
      to: [
        "barkat.travel@gmail.com",
        data.agent.email,
        data.passenger.contacts.emailID,
      ],
      subject: `E-Ticket No.${data.ticketID} `,
      html: `
        <p>Thank you for booking ticket from us.</p>
        <table width="100%">
          <thead>
            <tr>
              <th style="border: 1px solid #000">PNR Number</th>
              <th style="border: 1px solid #000">Booked on</th>
              <th style="border: 1px solid #000">Status</th>
              <th style="border: 1px solid #000">Booking ID</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; text-align: left;">${
                data.travel.pnr
              }</td>
              <td style="border: 1px solid #000; text-align: left;">
                ${moment(new Date(data.agent.bookingDate)).format(
                  "dddd, MMMM Do YYYY"
                )}
              </td>
              <td style="border: 1px solid #000; text-align: left;">Confirmed</td>
              <td style="border: 1px solid #000; text-align: left;">${
                data.ticketID
              }</td>
            </tr>
          </tbody>
        </table>
        <table width="100%">
          <thead>
            <tr>
              <th style="border: 1px solid #000">Flight</th>
              <th style="border: 1px solid #000">Departure</th>
              <th style="border: 1px solid #000">Arrival</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; text-align: left;">
                <strong>${data.travel.airlineName}</strong></br>
                <strong>Flight No.: </strong> ${data.travel.flightNumber}</br>
                <strong>Cabin: </strong> Econom</br>
              </td>
              <td style="border: 1px solid #000; text-align: left;">
                ${data.travel.location.locationCode.split("-")[0]}</br>
                  ${moment(new Date(data.travel.travelDate)).format(
                    "dddd, MMMM Do YYYY"
                  )} at ${data.travel.departureTime}
                </br>
              </td>
              <td style="border: 1px solid #000; text-align: left;">
                ${data.travel.location.locationCode.split("-")[1]}</br>
                at ${data.travel.arrivalTime}</br>
              </td>
            </tr>
          </tbody>
        </table>
        <table width="100%">
          <thead>
            <tr>
              <th style="border: 1px solid #000">Passengers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; text-align: left;">
                ${data.passenger.passengers
                  .map((psg) => {
                    return `${psg.title} ${psg.firstName} ${psg.lastName} <br />`;
                  })
                  .join("")}
              </td>
            </tr>
          </tbody>
        </table>
        <p>Thanks and regards,<br />Barkat Tours and Travels,<br />Prop. Barkat Sheikh</p>
      `,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log(error);
  }
}

function getPassengers(passengers) {
  passengers
    .map((psg) => {
      return `${psg.title} ${psg.firstName} ${psg.lastName} <br />`;
    })
    .join("");
}
// =============== Mail function end

async function validate(data) {
  let valid = false;
  const salableTicket = await getSalable(data.travel.pnr);
  const salableQty = salableTicket ? salableTicket.salable.qty : 0;
  const user = await findUserById(data.agent.id);
  const rate = data.fareDetails.rate;

  if (
    salableQty >= data.fareDetails.bookQty &&
    salableTicket.salable.salePrice === rate &&
    user.limit >= rate * data.fareDetails.bookQty
  ) {
    valid = true;
  }
  return valid;
}

async function getSalable(pnr) {
  return await SalableTicketModel.findOne({ pnr });
}

async function findUserById(id) {
  return await UserModel.findById({ _id: id });
}

async function updateLimit(data) {
  const user = await findUserById(data.agent.id);
  return await UserModel.findByIdAndUpdate(
    { _id: data.agent.id },
    {
      $set: {
        limit: user.limit - data.fareDetails.rate * data.fareDetails.bookQty,
      },
    },
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

// async function getAllBookedTickets(data) {
//   const limit = 10;
//   const skip = 5;
//   if (!data.agentId) {
//     return await BookTicketModel.find()
//       .sort({ "agent.bookingDate": -1 })
//       .limit(limit)
//       .skip(skip);
//   } else {
//     return await BookTicketModel.find({ "agent.id": data.agentId })
//       .sort({
//         "agent.bookingDate": -1,
//       })
//       .limit(limit)
//       .skip(skip);
//   }
// }

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
  const ticket = await getSalable(data.travel.pnr);
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
      travelDate: data.travel.travelDate,
      pnr: data.travel.pnr,
      totalFare,
    },
  };
  const newEnry = new AccountsModel(accountData);
  newEnry.save((err, accountData) => {
    if (err) console.log(err);
    else console.log("success");
  });
}

function getDue(user, ticketFare) {
  if (user.balance < ticketFare) {
    return Math.abs(user.balance - ticketFare) + user.due;
  } else {
    return 0;
  }
}

function getBalance(user, ticketFare) {
  if (user.balance < ticketFare) {
    return 0;
  } else {
    return Math.abs(user.balance - ticketFare);
  }
}

async function manageBalance(data) {
  const ticketFare =
    parseInt(data.fareDetails.bookQty) * parseInt(data.fareDetails.rate);
  const user = await AccountBalanceModel.findOne({ userID: data.agent.id });

  if (user) {
    await AccountBalanceModel.findOneAndUpdate(
      { userID: data.agent.id },
      {
        $set: {
          due: getDue(user, ticketFare),
          balance: getBalance(user, ticketFare),
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
  } else {
    const userData = {
      due: data.fareDetails.bookQty * data.fareDetails.rate,
      balance: 0,
      userID: data.agent.id,
    };
    const newEnry = new AccountBalanceModel(userData);
    newEnry.save((err, response) => {
      if (err) console.log(err);
      else console.log(response);
    });
  }
}

// Ticket Booking
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
    await manageBalance(data);
    await sendMail(data);
  } else {
    res.status(400).send({
      error:
        "Requested ticket Quantity or Rate mismatch. Please back to Ticket booking page and try again.",
    });
  }
});

// Get all booked tickets
router.post("/getBookedTickets", async (req, res, next) => {
  const allBookedTickets = await getAllBookedTickets(req.body);
  res.status(200).send(allBookedTickets);
});

// Confirming sale
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
