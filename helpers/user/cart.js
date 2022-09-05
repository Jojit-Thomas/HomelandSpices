const { Types } = require("mongoose");
const { PRODUCT_COLLECTION } = require("../../config/collections");
const cart_model = require("../../model/cart_model");

module.exports = {
  addToCart: (userId, productId) => {
    console.log("userId", userId, "productId", productId);
    console.log("userId", typeof userId, "productId", typeof productId);
    return new Promise((resolve, reject) => {
      console.log(userId, productId);
      try {
        productObj = {
          productId: Types.ObjectId(productId),
          quantity: 1,
        };

        cart_model.findOne({ userId: Types.ObjectId(userId) }).then((cart) => {
          console.log(cart);
          if (cart) {
            let state = false;
            let data = cart.cartItems.forEach((product) => {
              console.log(product.productId.toString(), "      ", productId);
              if (product.productId.toString() == Types.ObjectId(productId)) {
                return (state = true);
              }
            });
            console.log(data);
            if (state == true) {
              cart_model
                .updateOne(
                  {
                    userId: Types.ObjectId(userId),
                    "cartItems.productId": Types.ObjectId(productId),
                  },
                  {
                    $inc: {
                      "cartItems.$.quantity": 1,
                    },
                  }
                )
                .then((status) => {
                  resolve(status);
                });
            } else {
              cart_model
                .updateOne(
                  {
                    userId: Types.ObjectId(userId),
                  },
                  {
                    $push: {
                      cartItems: productObj,
                    },
                  },
                  {
                    upsert: true,
                  }
                )
                .then((status) => {
                  resolve(status);
                });
            }
          } else {
            cart_model
              .updateOne(
                {
                  userId: Types.ObjectId(userId),
                },
                {
                  $push: {
                    cartItems: productObj,
                  },
                },
                {
                  upsert: true,
                }
              )
              .then((status) => {
                resolve(status);
              });
          }
        });
      } catch (error) {
        console.error(error);
      }
    });
  },
  getCart: (userId) => {
    console.log(userId);
    return new Promise((resolve, reject) => {
      try {
        cart_model
          .aggregate([
            {
              $match: {
                userId: Types.ObjectId(userId),
              },
            },
            {
              $unwind: "$cartItems",
            },
            {
              $lookup: {
                from: PRODUCT_COLLECTION,
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "product",
              },
            },
            {
              $unwind: "$product",
            },
          ])
          //   .toArray()
          .then((data) => {
            console.log(data);
            resolve(data);
          });
      } catch (error) {
        console.error(error);
      }
    });
  },
  getTotalAmount: (userId) => {
    console.log(userId);
    return new Promise((resolve, reject) => {
      try {
        cart_model
          .aggregate([
            {
              $match: {
                userId: Types.ObjectId(userId),
              },
            },
            {
              $unwind: "$cartItems",
            },
            {
              $lookup: {
                from: PRODUCT_COLLECTION,
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "cart",
              },
            },
            {
              $unwind: "$cart",
            },
            {
              $unset: ["userId"],
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: [
                      "$cartItems.quantity",
                      { $toInt: "$cart.price" },
                    ],
                  },
                },
              },
            },
            {
              $unset: ["_id"],
            },
          ])
          .then((data) => {
            console.log(data[0]);
            let val = data[0] ? data[0].total : "0";
            resolve(val);
          });
      } catch (error) {
        console.error(error);
      }
    });
  },
  changeCartQuantity: (cartId, productId, count) => {
    console.log(cartId, productId, count);
    count = Number(count);
    return new Promise((resolve, reject) => {
      cart_model
        .updateOne({
          _id: Types.ObjectId(cartId),
          'cartItems.productId': Types.ObjectId(productId)
        }, {
          $inc: {
            'cartItems.$.quantity': count
          },
        })
        .then((status) => {

          resolve(status);
        });
    })
  },
  removeFromCart: (cartId, productId) => {
    return new Promise((resolve, reject) => {
      cart_model
        .updateOne({
          _id: Types.ObjectId(cartId),
          'cartItems.productId': Types.ObjectId(productId)
        }, {
          $pull: {
            'cartItems': {'productId':Types.ObjectId(productId)  }
          }
        })
        .then((status) => { 
          console.log(status)
          resolve(status);
        });
    })
  },
};
