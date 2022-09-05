const mongoose = require("mongoose");
const { USER_COLLECTION, WISHLIST_COLLECTION } = require("../config/collections");

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  wishlistItems: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("wishlist_model", wishlistSchema, WISHLIST_COLLECTION);
