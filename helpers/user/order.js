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
  reduceStock: (productId,quantity) => {
    return new Promise((resolve, reject) => {
      products_model.updateOne({
        _id: Types.ObjectId(productId),
      },{
        $inc: { stocks : -quantity}
      }).then(() => {
        resolve();
      })
    })
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
                "cart.price": 1,
              },
            },
          ])
          .then((data) => {
            console.log("total is : ", data);
            data.map((item) => {
              item.cartItems.total = item.total;
              item.cartItems.finalTotal = item.total;
              item.cartItems.price = item.cart.price;
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
      console.log(products, total);
      let status = data.paymentMethod === "paypal" ? "Received" : "Pending";
      try{
        var date = new Date().toLocaleString();
      } catch (error) {
        console.log(error)
      }
      let orderObj = {
        deliveryDetails: Types.ObjectId(data.addressId),
        userId: Types.ObjectId(data.userId),
        paymentMethod: data.paymentMethod,
        products: products,
        totalAmount: total,
        paymentStatus: status,
        date: date,
      };
      order_model.create(orderObj).then((cart) => {
        cart_model
          .deleteOne({
            userId: Types.ObjectId(data.userId),
          })
          .then(() => {
            console.log("order created data : ",cart)
            resolve({id: cart._id, total: cart.totalAmount});
          });
      })
    });
  },
  getOrders: (userId) => {
    return new Promise((resolve, reject) => {
      console.log(userId);
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
          {
            $set: {
              date: {
                $dateToString: { format: "%d/%m/%Y -- %H:%M", date: "$date" },
              },
            },
          },
          {
            $set: {
              productDetails : {$sortArray: { input: "$productDetails", sortBy: { _id: 1 } }}
            }
          },
          {
            $sort: { date: -1 }
          }
        ])
        .then((data) => {
          console.log(data)
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
          {
            $set: {
              productDetails : {$sortArray: { input: "$productDetails", sortBy: { _id: 1 } }}
            }
          },
          {
            $lookup: {
              from: ORDER_ADDRESS_COLLECTION,
              localField: "deliveryDetails",
              foreignField: "_id",
              as: "address",
            },
          },
        ])
        .then((data) => {
          console.log(data[0]);
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
          console.log(data);
          resolve();
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
