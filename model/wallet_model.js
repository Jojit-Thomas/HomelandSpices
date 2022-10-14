const mongoose = require("mongoose");
const {  WALLET_COLLECTION } = require("../config/collections");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  wallet: {
    type: Array,
    required: true
  },
});

module.exports = mongoose.model("wallet_model", walletSchema, WALLET_COLLECTION);
