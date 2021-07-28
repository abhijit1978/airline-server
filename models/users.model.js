const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    firstName: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    middleName: {
      type: String,
      required: false,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
  },
  email: String,
  contactNo: Number,
  alternateNo: Number,
  address: {
    houseNoStreeetName: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 50,
    },
    cityTownVillage: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    postOffice: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    policeStation: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    pin: {
      type: Number,
      require: true,
      minlength: 6,
      maxlength: 6,
    },
    state: {
      type: String,
      require: true,
      minlength: 3,
      maxlength: 50,
    },
    country: {
      type: String,
      require: true,
      minlength: 3,
      maxlength: 50,
    },
  },
  aadharNo: String,
  pan: {
    type: String,
    require: true,
    minlength: 10,
    maxlength: 10,
  },
  photoProof: String,
  addressProof: String,
  password: {
    type: String,
    require: true,
    minlength: 8,
    maxlength: 20,
  },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
