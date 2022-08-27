const mongoose = require("mongoose");
const { PRODUCT_COLLECTION } = require("../config/collections");

const productsSchema = new mongoose.Schema({
  title: String,
  desc: String,
  category: String,
  price: Number,
  stocks: Number,
  img_ext: String,
});

module.exports = mongoose.model("products", productsSchema, PRODUCT_COLLECTION);
