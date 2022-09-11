const mongoose = require("mongoose");
const { ADDRESS_COLLECTION, ORDER_ADDRESS_COLLECTION } = require("../config/collections");

const orderAddressModel = new mongoose.Schema({
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

module.exports = mongoose.model("order_address_model", orderAddressModel, ORDER_ADDRESS_COLLECTION);
