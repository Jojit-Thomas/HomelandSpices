const mongoose = require("mongoose");
const { CATEGORIES_COLLECTION } = require("../config/collections");

const categoriesSchema = new mongoose.Schema({
    title: String,
    desc: String,
    img_ext: String,
    discount: Number,
    date: mongoose.Schema.Types.Date,
})

module.exports = mongoose.model("Categories", categoriesSchema, CATEGORIES_COLLECTION);