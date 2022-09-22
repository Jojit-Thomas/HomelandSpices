const mongoose = require("mongoose");
const { USER_COLLECTION } = require("../config/collections");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: {
    type: String,
    required: true,
    min: 10,
    max: 11,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 50,
  },
  isAllowed: {
    required: true,
    type: Boolean,
  },
  wallet: Number,
  date:{
    type: Date, 
    default: new Date(),
  },
});

module.exports = mongoose.model("users", userSchema, USER_COLLECTION);
