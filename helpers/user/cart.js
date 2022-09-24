const { Types } = require("mongoose");
const { PRODUCT_COLLECTION } = require("../../config/collections");
const cart_model = require("../../model/cart_model");
const products_model = require("../../model/products_model");

module.exports = {
  addToCart: (userId, productId) => {
    return new Promise((resolve, reject) => {
      console.log(userId, productId);
      try {
        productObj = {
          productId: Types.ObjectId(productId),
          quantity: 1,
        };
        //checking the existence of the cart document
        cart_model.findOne({ userId: Types.ObjectId(userId) }).then(async (cart) => {
          if (cart) {
            // checking the existence of the product in the cart
            let state = await cart_model.findOne({ userId: Types.ObjectId(userId), "cartItems.productId": Types.ObjectId(productId) });
            if (state) {
              // if already exist increment the quantity
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
              //if not exist add to cartItems array
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
                total_max: {
                  $sum: "$cart.max_price"
                },
                total_amount: {
                  $sum: {
                    $multiply: [
                      "$cartItems.quantity",
                      { $toInt: "$cart.cd_price" },
                    ],
                  },
                },
                total_discount: {
                  $sum: {$subtract:["$cart.max_price",{ $toInt: "$cart.cd_price" }]},
                }
              },
            },
            {
              $unset: ["_id"],
            },
          ])
          .then((data) => {
            console.log(data[0]);
            let val = data[0] ? data[0] : {total : 0};
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
  cartProducts: (userId,quantity) => {
    return new Promise((resolve, reject) => {
      cart_model.aggregate([
        {
          $match: {
            userId: Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: PRODUCT_COLLECTION,
            localField: "cartItems.productId",
            foreignField: "_id",
            as: "cart",
          },
        },
        // {
        //   $unset: "cartItems"
        // },
      ]).then((data) => {
        console.log(data[0])
        resolve(data[0]);
      })
    })
  }
};
