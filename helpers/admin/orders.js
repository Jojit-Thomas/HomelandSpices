const { Types } = require("mongoose");
const {
  USER_COLLECTION,
  ORDER_ADDRESS_COLLECTION,
  PRODUCT_COLLECTION,
} = require("../../config/collections");
const order_model = require("../../model/order_model");

module.exports = {
  getOrders: (limit, offset, sort, sortValue) => {
    limit = parseInt(limit);
    offset = parseInt(offset);
    sort = parseInt(sort);
    let query = {};
    query[ sortValue.toLowerCase() ] = sort
    console.log(query);
    return new Promise((resolve, reject) => {
      order_model
        .aggregate([
          {
            $lookup: {
              from: ORDER_ADDRESS_COLLECTION,
              localField: "deliveryDetails",
              foreignField: "_id",
              as: "address",
            },
          },
          {
            $sort: query
          },
          {
            $set: {
              date: {
                $dateToString: { format: "%d/%m/%Y -- %H:%M", date: "$date", timezone: "+05:30" },
              },  
            },
          },
          {
            $skip : offset
          },
          {
            $limit: limit
          }
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
            $lookup: {
              from: USER_COLLECTION,
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $set: {
              date: {
                $dateToString: { format: "%d/%m/%Y -- %H:%M", date: "$date", timezone: "+05:30" },
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
  updatePaymentStatus: (orderId, paymentStatus) => {
    console.log(orderId, paymentStatus)
    return new Promise((resolve, reject) => {
      order_model.updateOne({
        _id: Types.ObjectId(orderId),
      },
      {
        $set: {
          payment_status: paymentStatus,
        }
      }).then(() => {
        resolve();
      }).catch((err) => {
        console.error(err)
      })
    })
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
          total_amount: { $sum: "$total_amount" },
          date: {$min: "$date"}
        }
      },
      {
        $sort: {date: 1}
      },
      {
        $limit: 14,
      }
      ]).then((data) => {
        let date =[]
        let total_amount =[]
        data.forEach((item) => {
          date.push(item.date.toDateString())
          total_amount.push(item.total_amount)
        })
        data = {date : date, total_amount: total_amount}
        console.log(data)
        resolve(data);
      })
    })
  }
};
