const express = require("express");
const router = express.Router();
const LocationModel = require("./../models/locations.model");

async function getLocations() {
  return await LocationModel.find().sort({ locationName: 1 });
}

async function findLocation(code) {
  return await LocationModel.find({ locationCode: code.toUpperCase() });
}

// Get all locations
router.get("/", async function (req, res, next) {
  const locations = await getLocations();
  res.status(200).send(locations);
});

// Add new Loation
router.post("/", async (req, res, next) => {
  const isLocationExist = await findLocation(req.body.locationCode);
  const { locationName, locationCode } = { ...req.body };
  const newLocation = new LocationModel({
    locationName,
    locationCode: locationCode.toUpperCase(),
  });

  if (!isLocationExist.length) {
    newLocation.save((err, newLocation) => {
      if (err) res.send({ erroMessage: "Some error", status: 500, error: err });
      res.status(200).send(newLocation);
    });
  } else {
    res.status(400).send({
      errorMessage: "Location code already exists",
    });
  }
});

module.exports = router;
