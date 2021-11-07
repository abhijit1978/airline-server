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

function password_generator(len) {
  var length = len ? len : 8;
  var string = "abcdefghijklmnopqrstuvwxyz"; //to upper
  var numeric = "0123456789";
  var punctuation = "~@#_";
  var password = "";
  var character = "";
  var crunch = true;
  while (password.length < length) {
    let entity1 = Math.ceil(string.length * Math.random() * Math.random());
    let entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
    let entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
    let hold = string.charAt(entity1);
    hold = password.length % 2 === 0 ? hold.toUpperCase() : hold;
    character += hold;
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }
  password = password
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join("");
  return password.substr(0, len);
}

const upload = multer({ storage });

async function getUsers() {
  return await UserModel.find(
    {},
    "userID name email contactNo alternateNo address aadharNo aadharImgUrl pan panImgUrl userType limit isApproved"
  ).sort({
    dateAppied: -1,
  });
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

async function findUserByEmail(email, aadharNo, pan) {
  users = await UserModel.find({ email, aadharNo, pan });
  return users[0];
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

async function setTempPassword(_id) {
  const password = password_generator();
  return await UserModel.findByIdAndUpdate(
    { _id },
    { $set: { password } },
    { new: true }
  );
}

async function changePsd(_id, password) {
  return await UserModel.findByIdAndUpdate(
    { _id },
    {
      $set: {
        password,
      },
    },
    { new: true }
  );
}

async function setimit(_id, limit) {
  return await UserModel.findByIdAndUpdate(
    { _id },
    { $set: { limit } },
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

// Get one user.
router.post("/oneUser", async function (req, res, next) {
  const user = await UserModel.findById(req.body.id);
  res.status(200).send({
    user: {
      id: user._id,
      userID: user.userID,
      name: user.name,
      email: user.email,
      isLoggedIn: user.isLoggedIn,
      userType: user.userType,
      limit: user.limit,
      address: user.address,
      aadharNo: user.aadharNo,
      aadharImgUrl: user.aadharImgUrl,
      pan: user.pan,
      panImgUrl: user.panImgUrl,
      contactNo: user.contactNo,
      alternateNo: user.alternateNo,
    },
  });
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
          limit: updatedUserData.limit,
          address: updatedUserData.address,
          aadharNo: updatedUserData.aadharNo,
          aadharImgUrl: updatedUserData.aadharImgUrl,
          pan: updatedUserData.pan,
          panImgUrl: updatedUserData.panImgUrl,
          contactNo: updatedUserData.contactNo,
          alternateNo: updatedUserData.alternateNo,
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

// Change Password
router.post("/changePassword", async function (req, res, next) {
  const { id, oldPassword, password } = { ...req.body };
  const foundUser = await findUserById(id);
  if (!foundUser || foundUser.password !== oldPassword) {
    res.status(400).send("User not found or incorrect current password!");
  } else {
    await changePsd(id, password);
    res.status(200).send("Password updated.");
  }
});

// Forgot Password
router.post("/forgotPassword", async function (req, res, next) {
  const { email, aadharNo, pan } = { ...req.body };
  const validUser = await findUserByEmail(email, aadharNo, pan);
  if (!validUser) {
    res.status(400).send("Invalid data");
  } else {
    const user = await setTempPassword(validUser._id);
    res.status(200).send({ psw: user.password });
  }
});

// Set  Limit
router.put("/setLimit", async function (req, res, next) {
  const { id, limit } = { ...req.body };
  const user = await findUserById(id);
  if (user) {
    await setimit(id, limit);
    res
      .status(200)
      .send({ message: "Limit updated succeffully", error: undefined });
  } else {
    res
      .status(400)
      .send({ message: "Limit updated failed", error: "User not found." });
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
    password,
    userType,
    isApproved,
  } = { ...req.body };

  if (!isUserExist.length) {
    let aadharImgUrl = "";
    let panImgUrl = "";
    req.files.forEach((item) => {
      if (item.fieldname === "aadharImage") {
        aadharImgUrl = item.path.replace("public", "");
      } else {
        panImgUrl = item.path.replace("public", "");
      }
    });
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
