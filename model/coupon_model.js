const mongoose = require("mongoose");
const { COUPON_COLLECTION } = require("../config/collections");

const couponSchema = new mongoose.Schema({
    title: String,
    desc: String,
    coupon_code : {
        type: String,
        unique: true,
    },
    discount: Number,
    total_coupon_used: Number,
    min_amount: Number,
    date: {
        type : mongoose.Schema.Types.Date,
        default : new Date(),
    },
})

module.exports = mongoose.model("coupon_model", couponSchema, COUPON_COLLECTION);