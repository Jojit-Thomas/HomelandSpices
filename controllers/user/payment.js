const { Types } = require("mongoose");
const Razorpay = require("razorpay");
const order_model = require("../../model/order_model");
require("dotenv").config();
var instance = new Razorpay({
  key_id: "rzp_test_8JLZOZRODQ9Mpc",
  key_secret: process.env.RAZORPAY_SECRET_ID,
});

module.exports = {
  getPaymentPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    res.render("user/payment", { user: user });
  },
  generateRazorpay: (orderId, totalAmount) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalAmount, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        console.log("new order ", order);
        resolve(order);
      });
    });
  },
  verifyPayment: (req, res) => {
    verifyPaymentController(req.body)
      .then(() => {
        changePaymentStatus(req.body["order[receipt]"])
          .then(() => {
            res.status(200).json({ status: true });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ status: false });
          });
      })
      .catch((err) => {
        res.status(500).json({ status: false });
      });
  },
};

function verifyPaymentController(data) {
  return new Promise((resolve, reject) => {
    console.log("hqqq", data);
    const crypto = require("crypto");
    var hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_ID);
    console.log(
      data["response[razorpay_order_id]"] +
        "|" +
        data["response[razorpay_payment_id]"]
    );
    hmac.update(
      data["response[razorpay_order_id]"] +
        "|" +
        data["response[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");
    console.log(hmac, " ---  ", data["response[razorpay_signature]"]);
    if (hmac == data["response[razorpay_signature]"]) {
      resolve();
    } else {
      reject("Payment failed");
    }
  });
}
