const express = require("express");
const router = express.Router();
const multer = require("multer");
const AirlineModel = require("../models/airlines.model");

const storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, "./public/images/uploads/");
  },
  filename: function (req, file, callBack) {
    callBack(null, `logo-${req.body.alias}.png`);
  },
});

const upload = multer({ dest: "./pulic/images/uploads/" });
// const upload = multer({ dest: "uploads" });

async function getAirlines() {
  return await AirlineModel.find().sort({ airlineName: 1 });
}

async function findAirlines(code) {
  return await AirlineModel.find({ airlineCode: code.toUpperCase() });
}

// Get all Airlines
router.get("/", async function (req, res, next) {
  const airlines = await getAirlines();
  res.status(200).send(airlines);
});

async function updateAirline(data) {
  return await AirlineModel.findByIdAndUpdate(
    { _id: data._id },
    {
      $set: {
        airlineName: data.airlineName,
        airlineCode: data.airlineCode,
        alias: data.alias,
      },
    },
    { new: true }
  );
}

// Add new Airline
router.post("/", upload.single("airlineLogo"), async (req, res, next) => {
  const isAirlineExist = await findAirlines(req.body.airlineCode);
  let airlineLogo = "some image";
  console.log(req.file, req.body);
  const { airlineName, airlineCode, alias } = { ...req.body };
  const newAirline = new AirlineModel({
    airlineName,
    airlineCode: airlineCode.toUpperCase(),
    alias,
    airlineLogo,
  });

  if (!isAirlineExist.length) {
    newAirline.save((err, newAirline) => {
      if (err) res.send({ erroMessage: "Some error", status: 500, error: err });
      else res.status(200).send(newAirline);
    });
  } else {
    res.status(400).send({
      errorMessage: "Airline code already exists",
    });
  }
});

// Update Airline
router.put("/", async function (req, res, next) {
  // request body props validation pending!!!!

  const result = await updateAirline(req.body);
  if (result) res.status(200).send(result);
  else res.status(400).send("Data not found!");
});

module.exports = router;
