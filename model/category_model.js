const mongoose = require("mongoose");
const { CATEGORIES_COLLECTION } = require("../config/collections");

const categoriesSchema = new mongoose.Schema({
    title: String,
    desc: String,
})

module.exports = mongoose.model("Categories", categoriesSchema, CATEGORIES_COLLECTION);