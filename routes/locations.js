const express = require("express");
const router = express.Router();
const LocationModel = require("./../models/locations.model");

async function getLocations() {
  return await LocationModel.find().sort({ locationName: 1 });
}

async function findLocation(code) {
  return await LocationModel.find({ locationCode: code.toUpperCase() });
}

async function updateLocation(data) {
  return await LocationModel.findByIdAndUpdate(
    { _id: data._id },
    {
      $set: {
        locationName: data.locationName,
        locationCode: data.locationCode,
        srcAirportName: data.srcAirportName,
        destAirportName: data.destAirportName,
      },
    },
    { new: true }
  );
}

// Get all locations
router.post("/", async function (req, res, next) {
  const locations = await getLocations();
  res.status(200).send(locations);
});

// Add new Loation
router.post("/new", async (req, res, next) => {
  const isLocationExist = await findLocation(req.body.locationCode);
  const { locationName, locationCode, srcAirportName, destAirportName } = {
    ...req.body,
  };
  const newLocation = new LocationModel({
    locationName,
    locationCode: locationCode.toUpperCase(),
    srcAirportName,
    destAirportName,
  });

  if (!isLocationExist.length) {
    newLocation.save((err, newLocation) => {
      if (err) res.status(400).send({ message: err, error: true });
      res.status(200).send(newLocation);
    });
  } else {
    res.status(400).send({
      error: true,
      message: "Location code already exists",
    });
  }
});

// Update Location
router.put("/", async function (req, res, next) {
  const result = await updateLocation(req.body);
  if (result) res.status(200).send(result);
  else res.status(400).send({ error: true, message: "Data not found" });
});

module.exports = router;
