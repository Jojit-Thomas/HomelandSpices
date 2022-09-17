const { Types } = require("mongoose");
const {
  USER_COLLECTION,
  ORDER_ADDRESS_COLLECTION,
  PRODUCT_COLLECTION,
} = require("../../config/collections");
const order_model = require("../../model/order_model");

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
          {
            $set: {
              date: {
                $dateToString: { format: "%d/%m/%Y -- %H:%M", date: "$date" },
              },
            },
          },
          {
            $sort: {date: -1}
          }
        ])
        .then((data) => {
          // console.log(data);
          // data[0] ? data[0].date = data[0].date.toLocaleString() : console.log("cannot set date");
          // data[0].date = data[0].date.toLocaleString()
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
          // {
          //   $sort: { }
          // }
        ])
        .then((data) => {
          // console.log(data[0])
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
  getStats: (timestamp) => {
    return new Promise((resolve, reject) => {
      timestamp = "$"+timestamp;
      console.log(timestamp);
      order_model.aggregate([
        { $group: {
          _id: {
            $add: [
             { $dayOfYear: "$date"}, 
             { $multiply: 
               [400, {$year: "$date"}]
             }
          ]},   
          totalAmount: { $sum: "$totalAmount" },
          date: {$min: "$date"}
        }
      },
      {
        $sort: {date: -1}
      },
      {
        $limit: 14,
      }
      ]).then((data) => {
        let date =[]
        let totalAmount =[]
        data.forEach((item) => {
          date.push(item.date.toDateString())
          totalAmount.push(item.totalAmount)
        })
        data = {date : date, totalAmount: totalAmount}
        console.log(data)
        resolve(data);
      })
    })
  }
};
