const { Types } = require("mongoose");
const order_model = require("../../model/order_model");

module.exports = {
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      console.log(orderId);
      order_model
        .updateOne(
          {
            _id: Types.ObjectId(orderId),
          },
          {
            $set: {
              paymentStatus: "Received",
            },
          }
        )
        .then((data) => {
          console.log("updated payment status ", data);
          resolve();
        })
        .catch((err) => {
          console.log("Error on payment updation", err);
        });
    });
  },
};
