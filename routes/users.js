const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserModel = require("./../models/users.model");

const storage = multer.diskStorage({
  destination: function (req, file, callBack) {
    callBack(null, "./public/images/uploads");
  },
  filename: function (req, file, callBack) {
    let fileName = "";
    if (file.fieldname === "aadharImage") {
      fileName = req.body.aadharNo + file.originalname;
    } else {
      fileName = req.body.pan + file.originalname;
    }
    callBack(null, fileName);
  },
});

const upload = multer({ storage });

async function getUsers() {
  return await UserModel.find().sort({ dateAppied: -1 });
}

async function findUser(email) {
  return await UserModel.find({ email });
}

async function findUserByEmailandPassword(email, password) {
  return await UserModel.findOne({ email, password });
}

async function findUserById(_id) {
  return await UserModel.findById({ _id });
}

async function updateLoginStatus(_id, type) {
  return await UserModel.findByIdAndUpdate(
    { _id },
    {
      $set: {
        isLoggedIn: type,
      },
    },
    { new: true }
  );
}

async function updateUserRole(_id, type) {
  return await UserModel.findByIdAndUpdate(
    { _id },
    {
      $set: {
        userType: type,
        isApproved: true,
      },
    },
    { new: true }
  );
}

const generateID = (pan, firstName, lastName) => {
  return `${firstName.substr(0, 1)}${lastName.substr(0, 1)}${pan.substr(5, 5)}`;
};

// Get all users list.
router.get("/", async function (req, res, next) {
  const users = await getUsers();

  res.status(200).send(users);
});

// User Login
router.put("/login", async function (req, res, next) {
  const { email, password } = { ...req.body };
  const foundUser = await findUserByEmailandPassword(email, password);
  if (foundUser) {
    if (foundUser.isApproved) {
      const updatedUserData = await updateLoginStatus(foundUser._id, true);
      res.status(200).send({
        user: {
          id: updatedUserData._id,
          userID: updatedUserData.userID,
          name: updatedUserData.name,
          email: updatedUserData.email,
          isLoggedIn: updatedUserData.isLoggedIn,
          userType: updatedUserData.userType,
        },
        message: `Login success!`,
      });
    } else {
      res
        .status(400)
        .send(
          "Your application is not approved yet. Please contact at fly.com"
        );
    }
  } else {
    res.status(400).send("Email or Password does not match!");
  }
});

// User Logout
router.put("/logout", async function (req, res, next) {
  const { id } = { ...req.body };
  const foundUser = await findUserById(id);
  if (foundUser) {
    await updateLoginStatus(id, false);
    res.status(200).send({
      message: `Logout success!`,
    });
  } else {
    res.status(400).send({
      errorMessage: "User not found!",
    });
  }
});

// Approve user and Set Role
router.put("/role", async function (req, res, next) {
  const { id, type } = { ...req.body };
  const foundUser = await findUserById(id);
  if (foundUser) {
    await updateUserRole(id, type);
    res.status(200).send("User is Approved and Role is updated.");
  } else {
    res.status(400).send("User not found!");
  }
});

// Add new user.
router.post("/", upload.any(), async (req, res, next) => {
  const isUserExist = await findUser(req.body.email);
  const {
    firstName,
    middleName = "",
    lastName,
    email,
    contactNo,
    alternateNo = 0,
    houseNoStreeetName,
    cityTownVillage,
    postOffice,
    pin,
    state,
    aadharNo,
    pan,
    aadharImgUrl,
    panImgUrl,
    password,
    userType,
    isApproved,
  } = { ...req.body };
  const newUser = new UserModel({
    name: { firstName, middleName, lastName },
    email,
    contactNo,
    alternateNo,
    address: {
      houseNoStreeetName,
      cityTownVillage,
      postOffice,
      pin,
      state,
    },
    aadharNo,
    pan,
    aadharImgUrl,
    panImgUrl,
    password,
    userID: generateID(pan, firstName, lastName),
    userType,
    isApproved,
  });

  if (!isUserExist.length) {
    newUser.save((err, newUser) => {
      if (err) {
        res.status(400).send({ error: err });
      } else {
        res.status(200).send("User added successfully");
      }
    });
  } else {
    res.status(400).send("User Email already exists");
  }
});

module.exports = router;
