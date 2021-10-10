const express = require("express");
const router = express.Router();
const multer = require("multer");
const AirlineModel = require("../models/airlines.model");

const storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, "./public/images/uploads/");
  },
  filename: function (req, file, callBack) {
    callBack(null, `airline-${new Date().getTime()}.png`);
  },
});

const upload = multer({ storage });

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
  let updateObj = {};
  if (data.airlineLogo) {
    updateObj = {
      airlineName: data.airlineName,
      alias: data.alias,
      airlineLogo: data.airlineLogo,
    };
  } else {
    updateObj = {
      airlineName: data.airlineName,
      alias: data.alias,
    };
  }
  return await AirlineModel.findByIdAndUpdate(
    { _id: data._id },
    { $set: updateObj },
    { new: true }
  );
}

// Add new Airline
router.post("/", upload.any(), async (req, res, next) => {
  let airlineLogo = "";
  req.files.forEach((item) => {
    airlineLogo = item.path.replace("public", "");
  });
  const isAirlineExist = await findAirlines(req.body.airlineCode);

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
router.put("/", upload.any(), async (req, res, next) => {
  let airlineLogo = "";
  req.files.forEach((item) => {
    airlineLogo = item.path.replace("public", "");
  });
  const result = await updateAirline({ ...req.body, airlineLogo });
  if (result) res.status(200).send(result);
  else res.status(400).send("Data not found!");
});

module.exports = router;
