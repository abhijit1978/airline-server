const express = require("express");
const router = express.Router();
const LocationModel = require("./../models/locations.model");

async function getLocations() {
  return await LocationModel.find().sort({ locationName: 1 });
}

async function findLocation(code) {
  return await LocationModel.find({ locationCode: code });
}

router.get("/", async function (req, res, next) {
  const locations = await getLocations();

  res.status(200).send({
    data: locations,
    message: `Total locations retrieved ${locations.length}`,
  });
});

router.post("/", async (req, res, next) => {
  const isLocationExist = await findLocation(req.body.locationCode);
  const newLocation = new LocationModel({
    locationName: req.body.locationName,
    locationCode: req.body.locationCode.toUpperCase(),
    airportName: req.body.airportName,
  });

  if (!isLocationExist.length) {
    newLocation.save((err, newLocation) => {
      if (err) res.send({ erroMessage: "Some error", status: 500, error: err });
      res.status(200).send({
        successMessage: "Location added successfully",
        data: newLocation,
      });
    });
  } else {
    res.status(400).send({
      errorMessage: "Location code already exists",
    });
  }
});

module.exports = router;
