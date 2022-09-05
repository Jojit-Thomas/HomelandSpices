const { Types } = require("mongoose");
const { PRODUCT_COLLECTION } = require("../../config/collections");
const cart_model = require("../../model/cart_model");
const order_model = require("../../model/order_model");


module.exports = {
  placeOrder: (order, products, total) => {
    return new Promise((resolve, reject) => {
      console.log(order, products, total);
      let status = order.paymentMethod === "cod" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: {
          name: order.name,
          phone: order.phone,
          address: order.address,
        },
        userId: Types.ObjectId(order.userId),
        paymentMethod: order.paymentMethod,
        products: products,
        totalAmount: total,
        status: status,
        date: new Date(),
      };
      get()
        .collection(ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((cart) => {
          get()
            .collection(CART_COLLECTION)
            .deleteOne({ userId: Types.ObjectId(order.userId) })
            .then(() => {
              resolve();
            });
        });
    });
  },
  getCartProdutDetails: (userId) => {
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
                from: "products",
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
              $match: {
                cartItems: {
                  $exists: true,
                },
              },
            },
            {
              $set: {
                total: {
                  $multiply: [
                    "$cartItems.quantity",
                    {
                      $toInt: "$cart.price",
                    },
                  ],
                },
              },
            },
            {
              $project: {
                cartItems: 1,
                total: 1,
              },
            },
          ])
          .then((data) => {
            console.log("total is : ", data);
            data.map((item) => {
              item.cartItems.total = item.total;
              item.cartItems.status = "Order Placed";
            });
            let products = [];
            data.forEach((item) => {
              products.push(item.cartItems);
            });
            console.log("modified data is : ", data);
            resolve(products);
          });
      } catch (error) {
        console.error(error);
      }
    });
  },
  placeOrder: (data, products, total) => {
    return new Promise((resolve, reject) => {
      console.log( products, total);
      let status = data.paymentMethod === "cod" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: Types.ObjectId(data.addressId),
        userId: Types.ObjectId(data.userId),
        paymentMethod: data.paymentMethod,
        products: products,
        totalAmount: total,
        paymentStatus: status,
        date: new Date(),
      };
      // get()
      //   .collection(ORDER_COLLECTION)
      //   .insertOne(orderObj)
        order_model.create(orderObj)
        .then((cart) => {
          // get()
          //   .collection(CART_COLLECTION)
            cart_model
            .deleteOne({
              userId: Types.ObjectId(data.userId),
            })
            .then(() => {
              resolve();
            });
        });
    });
  },
  getOrders: (userId) => {
    return new Promise((resolve, reject) => {
      order_model
        .aggregate([
          {
            $match: {
              userId: Types.ObjectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: PRODUCT_COLLECTION,
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $sort: {date: -1}
          }
        ])
        .then((data) => {
          resolve(data);
        });
    });
  },
  // getOrderDetails: (orderId) => {
  //   return new Promise((resolve, reject) => {
  //     order_model
  //       .aggregate([
  //         {
  //           $match: {
  //             _id: Types.ObjectId(orderId),
  //           },
  //         },
  //         {
  //           $unwind: "$products",
  //         },
  //         {
  //           $lookup: {
  //             from: PRODUCT_COLLECTION,
  //             localField: "products.productId",
  //             foreignField: "_id",
  //             as: "productDetails",
  //           },
  //         },
  //         {
  //           $unwind: "$productDetails",
  //         },
  //       ])
  //       .then((data) => {
  //         resolve(data);
  //       });
  //   });
  // },
  cancelOrders: (orderId, productId) => {
    return new Promise((resolve, reject) => {
      console.log(orderId, productId);
      order_model
        .updateOne(
          {
            _id: Types.ObjectId(orderId),
            "products.productId": Types.ObjectId(productId),
          },
          {
            $set: {
              "products.$.status": "cancelled",
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
