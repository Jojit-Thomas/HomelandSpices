const mongoose = require("mongoose");
const { ADDRESS_COLLECTION } = require("../config/collections");

const addressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  phone: {
    type: String,
    required: true,
    min: 10,
    max: 10,
  },
  locality: String,
  city: String,
  state: String,
  pincode: Number,
  houseName: String,
  landmark: String,
  postOffice: String,
});

module.exports = mongoose.model("address_model", addressSchema, ADDRESS_COLLECTION);
