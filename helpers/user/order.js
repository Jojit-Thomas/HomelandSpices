const { Types } = require("mongoose");
const {
  PRODUCT_COLLECTION,
  ORDER_ADDRESS_COLLECTION,
} = require("../../config/collections");
const cart_model = require("../../model/cart_model");
const order_model = require("../../model/order_model");
const products_model = require("../../model/products_model");

module.exports = {
  // placeOrder: (order, products, total) => {
  //   return new Promise((resolve, reject) => {
  //     console.log(order, products, total);
  //     let status = order.paymentMethod === "cod" ? "placed" : "pending";
  //     let orderObj = {
  //       deliveryDetails: {
  //         name: order.name,
  //         phone: order.phone,
  //         address: order.address,
  //       },
  //       userId: Types.ObjectId(order.userId),
  //       paymentMethod: order.paymentMethod,
  //       products: products,
  //       totalAmount: total,
  //       status: status,
  //       date: new Date(),
  //     };
  //     get()
  //       .collection(ORDER_COLLECTION)
  //       .insertOne(orderObj)
  //       .then((cart) => {
  //         get()
  //           .collection(CART_COLLECTION)
  //           .deleteOne({
  //             userId: Types.ObjectId(order.userId)
  //           })
  //           .then(() => {
  //             resolve();
  //           });
  //       });
  //   });
  // },
  reduceStock: (productId, quantity) => {
    return new Promise((resolve, reject) => {
      products_model
        .updateOne(
          {
            _id: Types.ObjectId(productId),
          },
          {
            $inc: { stocks: -quantity },
          }
        )
        .then(() => {
          resolve();
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
                      $toInt: "$cart.cd_price",
                    },
                  ],
                },
              },
            },
            {
              $project: {
                cartItems: 1,
                total: 1,
                "cart.cd_price": 1,
                "cart.max_price": 1,
                "cart.total_discount": 1,
              },
            },
          ])
          .then((data) => {
            console.log("total is : ", data);
            data.map((item) => {
              // item.cartItems.cd_price = item.total;
              // item.cartItems.finalTotal = item.total;
              item.cartItems.cd_price = item.cart.cd_price;
              item.cartItems.max_price = item.cart.max_price;
              item.cartItems.total_discount = item.cart.total_discount;
              //item.cartItems.weight = item.cartItems.weight;
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
  placeOrder: (data, products, order) => {
    return new Promise((resolve, reject) => {
      var date = new Date().toLocaleString();
      const { paymentMethod, addressId, coupon, coupon_code, userId } = data;
      let { total_amount, total_max, total_discount} = order;
      total_amount = total_amount - coupon
      console.log("total_amount: " + total_amount + "coupon: " + coupon)
      let status = paymentMethod === "paypal" ? "Received" : "Pending";
      let orderObj = {
        deliveryDetails: Types.ObjectId(addressId),
        userId: Types.ObjectId(userId),
        payment_method: paymentMethod,
        products: products,
        total_amount: total_amount,
        total_max: total_max,
        total_discount: total_discount,
        coupon_code: coupon_code,
        coupon: Number(coupon),
        payment_status: status,
        date: date,
      };
      order_model.create(orderObj).then((cart) => {
        console.log(data.paymentMethod);
        console.log(cart);
        if (data.paymentMethod !== "razorPay") {
          console.log("deleting the cart items");
          cart_model
            .deleteOne({
              userId: Types.ObjectId(data.userId),
            })
            .then(() => {
              console.log("order created data : ", cart);
              resolve({ id: cart._id, total: cart.total_amount });
            });
        } else {
          resolve({ id: cart._id, total: cart.total_amount });
        }
      });
    });
  },
  getOrders: (userId) => {
    return new Promise((resolve, reject) => {
      console.log("in order helper page : ", userId);
      order_model
        .aggregate([
          {
            $match: {
              userId: Types.ObjectId(userId),
            },
          },
          {
            $lookup: {
              from: ORDER_ADDRESS_COLLECTION,
              localField: "deliveryDetails",
              foreignField: "_id",
              as: "address",
            },
          },
          {
            $lookup: {
              from: PRODUCT_COLLECTION,
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          // {
          //   $unwind: "$productDetails.weight"
          // },
          // {
          //   $set: {
          //     productDetails: {
          //       $sortArray: { input: "$productDetails", sortBy: { _id: -1 } },
          //     },
          //   },
          // },
          {
            $sort: { date: -1 },
          },
          {
            $set: {
              date: {
                $dateToString: {
                  format: "%d/%m/%Y -- %H:%M",
                  date: "$date",
                  timezone: "+05:30",
                },
              },
            },
          },
        ])
        .then((data) => {
          data.forEach((item) => {
            item.productDetails.sort(function (a, b) {
              return a.cd_price - b.cd_price;
            })
            item.products.sort(function (a, b) {
              return a.cd_price - b.cd_price;
            })
            if(item.products.length > 1) {
              console.log(item.products)
            }
          })
          resolve(data);
        });
    });
  },
  getOrderDetails: (orderId, productId) => {
    return new Promise((resolve, reject) => {
      order_model
        .aggregate([
          {
            $match: {
              _id: Types.ObjectId(orderId),
            },
          },
          {
            $lookup: {
              from: PRODUCT_COLLECTION,
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          // {
          //   $unwind: "$productDetails"
          // },
          // {
          //   $set: {
          //     productDetails: {
          //       $sortArray: { input: "$productDetails", sortBy: { _id: 1 } },
          //     },
          //   },
          // },
          {
            $lookup: {
              from: ORDER_ADDRESS_COLLECTION,
              localField: "deliveryDetails",
              foreignField: "_id",
              as: "address",
            },
          },
          // {
          //   $unwind: "$productDetails"
          // },
        ])
        .then((data) => {
          data.forEach((item) => {
            item.productDetails.sort(function (a, b) {
              return a.cd_price - b.cd_price;
            })
            item.products.sort(function (a, b) {
              return a.cd_price - b.cd_price;
            })
            if(item.products.length > 1) {
              console.log(item.products)
            }
          })
          resolve(data[0]);
        });
    });
  },
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
              "products.$.finalTotal": "0",
            },
          }
        )
        .then((data) => {
          console.log("cancel ", data);
          resolve();
        });
    });
  },
  getOrderProductPrice: (orderId, productId) => {
    return new Promise((resolve, reject) => {
      order_model
        .findOne({
          _id: Types.ObjectId(orderId),
          "products.productId": Types.ObjectId(productId),
        })
        .then((data) => {
          console.log("price is : " + data?.products?.[0])
          console.log(data.products[0].cd_price)
          resolve(data?.products?.[0]?.cd_price);
        });
    });
  },
  // totalOrderAmount: (orderId) => {
  //   return new Promise((resolve, reject) => {
  //     console.log(orderId);
  //     order_model
  //       .aggregate([
  //         {$match: { _id: Types.ObjectId(orderId)}},
  //         {
  //           $project: {
  //             _id : null,
  //             totalAmount: "$products.$.finalTotal"//this doesn't work
  //           }
  //         }
  //       ])
  //       .then((data) => {
  //         console.log("total is : ",data[0].totalAmount);
  //         resolve();
  //       });
  //   });
  // },

  // addOrderProducts: (userId, products) => {
  //   return new Promise((resolve, reject) => {
  //     delete products._id;
  //     products.userId = userId;
  //     console.log("Products in addorderproducts is : ",products);
  //     order_products_model.create(products).then((data) => {
  //       resolve(data.insertedId);
  //     });
  //   });
  // },
};
