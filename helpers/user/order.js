const { Types } = require("mongoose");
const {
  PRODUCT_COLLECTION,
  ORDER_ADDRESS_COLLECTION,
} = require("../../config/collections");
const cart_model = require("../../model/cart_model");
const order_model = require("../../model/order_model");


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
      console.log(products, total);
      let status = data.paymentMethod === "cod" ? "placed" : "pending";
      try{
        var date = new Date().toLocaleString();
      } catch (error) {
        console.log(error)
      }
      console.log("date is: ",date)
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
            $sort: {
              date: -1,
            },
          },
        ])
        .then((data) => {
          data[0] ? (data[0].date = data[0].date.toLocaleDateString()) : false;
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
            $unwind: "$products",
          },
          {
            $match: {
              "products.productId": Types.ObjectId(productId),
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
            $unwind: "$productDetails",
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
            $unwind: "$address",
          },
        ])
        .then((data) => {
          console.log(data);
          resolve(data);
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
            },
          }
        )
        .then((data) => {
          console.log(data);
          resolve();
        });
    });
  },
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
