const mongoose = require("mongoose");
const { ORDER_PRODUCT_COLLECTION } = require("../config/collections");

const orderProductsSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  desc: String,
  category: String,
  price: Number,
  stocks: Number,
  img_ext: String,
  isDeleted: Boolean,
});

module.exports = mongoose.model("order_products_model", orderProductsSchema, ORDER_PRODUCT_COLLECTION);
