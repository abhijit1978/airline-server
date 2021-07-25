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

  res.send({
    data: locations,
    status: 200,
    message: `Total locations retrieved ${locations.length}`,
  });
});

router.post("/addNew", async (req, res, next) => {
  const locationExists = await findLocation(req.body.locationCode);
  const newLocation = new LocationModel({
    locationName: req.body.locationName,
    locationCode: req.body.locationCode,
    airportName: req.body.airportName,
  });

  if (!locationExists.length) {
    newLocation.save((err, newLocation) => {
      if (err) res.send({ erroMessage: "Some error", status: 500, error: err });
      res.send({
        successMessage: "Location added successfully",
        data: newLocation,
        status: 200,
      });
    });
  } else {
    res.send({
      worning: "Location code exists",
      data: newLocation,
      status: 200,
    });
  }
});

module.exports = router;
