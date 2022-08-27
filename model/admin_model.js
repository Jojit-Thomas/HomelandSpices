const mongoose = require("mongoose");
const { ADMIN_CREDENTIALS } = require("../config/collections");

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: {
    type: Number,
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

module.exports = mongoose.model("admin", adminSchema, ADMIN_CREDENTIALS);
