const mongoose = require("mongoose");
const { PRODUCT_COLLECTION } = require("../config/collections");

const productsSchema = new mongoose.Schema({
  title: String,
  desc: String,
  category: mongoose.Schema.Types.ObjectId,
  price: Number,
  stocks: Number,
  img_ext: String,
  isDeleted: Boolean,
});

module.exports = mongoose.model("products", productsSchema, PRODUCT_COLLECTION);
