const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    firstName: { type: String, required: true, minlength: 5, maxlength: 50 },
    middleName: { type: String, required: false, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
  },
  email: { type: String, require: true, minlength: 0, maxlength: 100 },
  dob: { type: Date, require: true, default: Date.now },
  contactNo: { type: Number, require: true, minlength: 10, maxlength: 10 },
  alternateNo: { type: Number, require: false, minlength: 0, maxlength: 10 },
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
  pan: { type: String, require: true, minlength: 10, maxlength: 10 },
  photoProof: String,
  addressProof: String,
  password: { type: String, require: true, minlength: 8, maxlength: 20 },
  dateAppied: { type: Date, require: true, default: Date.now },
  userType: { type: String, default: "Unknown", require: true },
  isApproved: { type: Boolean, default: false, require: true },
  isLoggedIn: { type: Boolean, require: true, default: false },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
