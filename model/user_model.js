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
});

module.exports = mongoose.model("users", userSchema, USER_COLLECTION);
