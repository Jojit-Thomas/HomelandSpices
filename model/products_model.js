const mongoose = require("mongoose");
const { PRODUCT_COLLECTION } = require("../config/collections");

const productsSchema = new mongoose.Schema({
  title: String,
  desc: String,
  category: mongoose.Schema.Types.ObjectId,
  pd_price: {
    type: Number,
    default : 0,
  },
  cd_price: {
    type: Number,
    default : 0,
  },
  stocks: {
    type: Number,
    default : 0,
  },
  img_ext: String,
  isDeleted: Boolean,
  discount: {
    type: Number,
    default : 0,
  },
  max_price: {
    type: Number,
    default : 0,
  },
  date:{
    type: Date, 
    default: new Date(),
  },
  total_discount: Number,
});

module.exports = mongoose.model("products", productsSchema, PRODUCT_COLLECTION);
