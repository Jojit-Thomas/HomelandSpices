const mongoose = require("mongoose");
const { BANNER_COLLECTION } = require("../config/collections");

const bannerSchema = new mongoose.Schema({
  title: String,
  img_name: String,
  img_ext: String,
  position: Number,
});

module.exports = mongoose.model("banner_model", bannerSchema, BANNER_COLLECTION);
