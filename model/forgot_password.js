const mongoose = require("mongoose");
const { RESET_PASSWORD_COLLECTION } = require("../config/collections");

const resetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  modifiedAt: {
    type: Date,
    default: Date.now ,
  },
});

module.exports = mongoose.model(
  "forgot_password_models",
  resetSchema,
  RESET_PASSWORD_COLLECTION
);
