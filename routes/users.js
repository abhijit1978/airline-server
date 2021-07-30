var express = require("express");
var router = express.Router();
const UserModel = require("./../models/users.model");

async function getUsers() {
  return await UserModel.find().sort({ "name.firstName": 1 });
}

async function findUser(email) {
  return await UserModel.find({ email });
}

async function findUserByEmailandPassword(email, password) {
  return await UserModel.findOne({ email, password });
}

/* Get all users list. */
router.get("/", async function (req, res, next) {
  const users = await getUsers();

  res.status(200).send({
    data: users,
    message: `Total users retrieved ${users.length}`,
  });
});

// User Login
router.post("/login", async function (req, res, next) {
  const { email, password } = { ...req.body };
  const foundUser = await findUserByEmailandPassword(email, password);
  if (foundUser) {
    res.status(200).send({
      data: { email: foundUser.email, id: foundUser._id },
      message: `Login success!`,
    });
  } else {
    res.status(400).send({
      errorMessage: "Email or Password does not match!",
    });
  }
});

/* Add new user. */
router.post("/", async (req, res, next) => {
  const isUserExist = await findUser(req.body.email);
  const {
    firstName,
    middleName = "",
    lastName,
    email,
    dob,
    contactNo,
    alternateNo = 0,
    houseNoStreeetName,
    cityTownVillage,
    postOffice,
    policeStation,
    pin,
    state,
    country,
    aadharNo,
    pan,
    photoProof,
    addressProof,
    password,
    userType,
    isApproved,
  } = { ...req.body };
  const newUser = new UserModel({
    name: { firstName, middleName, lastName },
    email,
    dob,
    contactNo,
    alternateNo,
    address: {
      houseNoStreeetName,
      cityTownVillage,
      postOffice,
      policeStation,
      pin,
      state,
      country,
    },
    aadharNo,
    pan,
    photoProof,
    addressProof,
    password,
    userType,
    isApproved,
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
