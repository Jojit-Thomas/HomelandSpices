const mongoose = require("mongoose");
const { ORDER_COLLECTION } = require("../config/collections");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  deliveryDetails: mongoose.Schema.Types.ObjectId,
  products: Array,
  totalAmount: Number,
  status: String,
  paymentMethod: String,
  paymentStatus: String,
  date: Date,
});

module.exports = mongoose.model("order_model", orderSchema, ORDER_COLLECTION);
