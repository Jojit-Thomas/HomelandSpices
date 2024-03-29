const { Types } = require("mongoose");
const { changePaymentStatus } = require("../../helpers/user/payment");
const Razorpay = require("razorpay");
const { getTotalAmount } = require("../../helpers/user/cart");
const cart_model = require("../../model/cart_model");
const createHttpError = require("http-errors");
require("dotenv").config();
var instance = new Razorpay({
  key_id: "rzp_test_8JLZOZRODQ9Mpc",
  key_secret: process.env.RAZORPAY_SECRET_ID,
});

module.exports = {
  getPaymentPage: async (req, res, next) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let amount = await getTotalAmount(user.userId);
    if(amount.total_amount <= 0) {
      next(createHttpError.BadRequest("Cart is empty."))
    } else {
      res.render("user/payment", { user: user, order: amount });
    }
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
    let user = req.cookies.user ? req.cookies.user : null;
    verifyPaymentController(req.body)
      .then(() => {
        changePaymentStatus(req.body["order[receipt]"])
          .then(async () => {
            console.log("success");
            await cart_model
              .deleteOne({
                userId: Types.ObjectId(user.userId),
              })
            res.status(200).send({ status: true });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ status: false });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ status: false });
      });
  },
};

function verifyPaymentController(data) {
  return new Promise((resolve, reject) => {
    console.log("hqqq", data);
    const crypto = require("crypto");
    var hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_ID);
    hmac.update(
      data["response[razorpay_order_id]"] +
        "|" +
        data["response[razorpay_payment_id]"]
    );
    hmac = hmac.digest("hex");
    if (hmac == data["response[razorpay_signature]"]) {
      resolve();
    } else {
      console.log(
        "not identical",
        hmac,
        "   ",
        data["response[razorpay_signature]"]
      );
      reject("Payment failed");
    }
  });
}
