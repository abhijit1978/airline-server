var express = require("express");
var router = express.Router();
const UserModel = require("./../models/users.model");

async function getUsers() {
  return await UserModel.find().sort({ firstName: 1 });
}

async function findUser(email) {
  return await UserModel.find({ email: email });
}

/* Get all users list. */
router.get("/", async function (req, res, next) {
  const users = await getUsers();

  res.status(200).send({
    data: users,
    message: `Total users retrieved ${users.length}`,
  });
});

// /* Add new user. */
router.post("/", async (req, res, next) => {
  console.log("request received: ", req.body);
  const isUserExist = await findUser(req.body.email);
  const newUser = new UserModel({
    name: {
      firstName: req.body.firstName,
      middleName: req.body.middleName || "",
      lastName: req.body.lastName,
    },
    email: req.body.email,
    contactNo: req.body.contactNo,
    alternateNo: req.body.alternateNo || 0,
    address: {
      houseNoStreeetName: req.body.houseNoStreeetName,
      cityTownVillage: req.body.cityTownVillage,
      postOffice: req.body.postOffice,
      policeStation: req.body.policeStation,
      pin: req.body.pin,
      state: req.body.state,
      country: req.body.country,
    },
    aadharNo: req.body.aadharNo,
    pan: req.body.pan,
    photoProof: req.body.photoProof,
    addressProof: req.body.addressProof,
    password: req.body.password,
  });

  if (!isUserExist.length) {
    newUser.save((err, newUser) => {
      if (err)
        res.send({ erroMessage: "Server error", status: 500, error: err });
      res.status(200).send({
        successMessage: "User added successfully",
        data: newUser,
      });
    });
  } else {
    res.status(400).send({
      errorMessage: "User Email already exists",
    });
  }
});

module.exports = router;
