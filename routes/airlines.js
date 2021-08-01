const express = require("express");
const router = express.Router();
const AirlineModel = require("../models/airlines.model");

async function getAirlines() {
  return await AirlineModel.find().sort({ airlineName: 1 });
}

async function findAirlines(code) {
  return await AirlineModel.find({ airlineCode: code.toUpperCase() });
}

router.get("/", async function (req, res, next) {
  const airlines = await getAirlines();
  res.status(200).send(airlines);
});

router.post("/", async (req, res, next) => {
  const isAirlineExist = await findAirlines(req.body.airlineCode);
  const { airlineName, airlineCode, alias } = { ...req.body };
  const newAirline = new AirlineModel({
    airlineName,
    airlineCode: airlineCode.toUpperCase(),
    alias,
  });

  if (!isAirlineExist.length) {
    newAirline.save((err, newAirline) => {
      if (err) res.send({ erroMessage: "Some error", status: 500, error: err });
      res.status(200).send(newAirline);
    });
  } else {
    res.status(400).send({
      errorMessage: "Airline code already exists",
    });
  }
});

module.exports = router;
