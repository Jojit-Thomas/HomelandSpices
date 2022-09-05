const { Types } = require("mongoose");
const { USER_COLLECTION } = require("../../config/collections");
const order_model = require("../../model/order_model")

module.exports = {
  getOrders: () => {
    return new Promise((resolve, reject) => {
      order_model
        .aggregate([
          {
            $lookup: {
              from: USER_COLLECTION,
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
        ])
        .then((data) => {
          console.log(data);
          resolve(data);
        });
    });
  },
  getOrderDetails: (orderId) => {
    return new Promise((resolve, reject) => {
      console.log(orderId);
      order_model
        .aggregate([
          {
            $match: {
              _id: Types.ObjectId(orderId),
            },
          },
          {
            $lookup: {
              from: USER_COLLECTION,
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: "$user",
          },
        ])
        .then((data) => {
          // console.log(data)
          resolve(data[0]);
        });
    });
  },
  updateOrderStatus: (orderId, productId, status) => {
    return new Promise((resolve, reject) => {
      order_model
        .updateOne(
          {
            _id: Types.ObjectId(orderId),
            "products.productId": Types.ObjectId(productId),
          },
          {
            $set: {
              "products.$.status": status,
            },
          }
        )
        .then((data) => {
          console.log(data);
          resolve();
        });
    });
  },
};
