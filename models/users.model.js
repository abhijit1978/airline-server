const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    firstName: { type: String, required: true, minlength: 3, maxlength: 50 },
    middleName: { type: String, required: false, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
  },
  agencyName: { type: String, required: true, minlength: 2, maxlength: 100 },
  email: { type: String, require: true, minlength: 9, maxlength: 50 },
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
  },
  aadharNo: { type: String, require: true, minlength: 12, maxlength: 12 },
  pan: { type: String, require: true, minlength: 10, maxlength: 10 },
  aadharImgUrl: { type: String, default: "some url" },
  panImgUrl: { type: String, default: "some url" },
  password: { type: String, require: true, minlength: 8, maxlength: 20 },
  dateAppied: { type: Date, require: true, default: Date.now },
  userID: { type: String, required: true, minlength: 7, maxlength: 7 },
  userType: { type: String, default: "Unknown", require: true },
  isApproved: { type: Boolean, default: false, require: true },
  isLoggedIn: { type: Boolean, require: true, default: false },
  limit: { type: Number, require: true, default: 0 },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
