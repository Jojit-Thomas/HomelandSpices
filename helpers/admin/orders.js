const createHttpError = require("http-errors");
const { Types, default: mongoose } = require("mongoose");
const {
  USER_COLLECTION,
  ORDER_ADDRESS_COLLECTION,
  PRODUCT_COLLECTION,
} = require("../../config/collections");
const order_model = require("../../model/order_model");
const user_model = require("../../model/user_model");

module.exports = {
  getOrders: (offset, limit, sort, sortValue) => {
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
          resolve(data);
        });
    });
  },
  getOrderCount: () => {
    return new Promise((resolve, reject) => {
      order_model.find().count().then((count) => resolve(count));
    })
  },
  getOrderDetails: (orderId) => {
    return new Promise((resolve, reject) => {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        reject(createHttpError.NotFound()); //If the provided userId is not a valid ObjectId
      }
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
        $limit: 16,
      }
      ]).then((data) => {
        let date =[]
        let total_amount =[]
        data.forEach((item) => {
          date.push(item.date.toLocaleDateString())
          total_amount.push(item.total_amount)
        })
        data = {date : date, total_amount: total_amount}
        console.log(data)
        resolve(data);
      })
    })
  },
  getStatsWeekly: (timestamp) => {
    return new Promise((resolve, reject) => {
      timestamp = "$"+timestamp;
      console.log(timestamp);
      order_model.aggregate([
        { $group: {
          _id: {
            $add: [
             { $week: "$date"}, 
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
        $limit: 16,
      }
      ]).then((data) => {
        let date =[]
        let total_amount =[]
        data.forEach((item) => {
          date.push(item.date.toLocaleDateString())
          total_amount.push(item.total_amount)
        })
        data = {date : date, total_amount: total_amount}
        console.log(data)
        resolve(data);
      })
    })
  },
  userStatsCount: () => {
    return new Promise((resolve, reject) => {
      console.log("in stats count")
      let current_date = new Date()
      let date = new Date(current_date.getTime() - 7 * 24 * 60 * 60 * 1000)
      console.log(date)
      user_model.aggregate([
        { $match: { date: { $gte: new Date(date) } } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $sort: { _id: 1} }
      ]).then((data) => {
        console.log("stats date count",data)
        resolve(data?.[0] ? data[0]?.count : 0);
      })
    })
  },
  orderStatsCount: () => {
    return new Promise((resolve, reject) => {
      console.log("in stats count")
      let current_date = new Date()
      let date = new Date(current_date.getTime() - 7 * 24 * 60 * 60 * 1000)
      console.log(date)
      order_model.aggregate([
        { $match: { date: { $gte: new Date(date) } } },
        { $group: { _id: null, count: { $sum: 1 } } },
        { $sort: { _id: 1} }
      ]).then((data) => {
        console.log("stats date count",data)
        resolve(data?.[0] ? data[0]?.count : 0);
      })
    })
  },
  orderPendingdispatchStatsCount: () => {
    return new Promise((resolve, reject) => {
      console.log("in stats count")
      let current_date = new Date()
      let date = new Date(current_date.getTime() - 7 * 24 * 60 * 60 * 1000)
      console.log(date)
      order_model.aggregate([
        { $unwind: "$products"},
        { $match: { date: { $gte: new Date(date) }, "products.status" : {$eq: "Order Placed"} } },
        { $project: {products : 1}},  
        { $sort: { _id: 1} }
      ]).then((data) => {
        console.log("stats date asdf count",data.length)
        resolve(data?.length ? data.length : 0);
      })
    })
  },
  orderPendingDeliveryStatsCount: () => {
    return new Promise((resolve, reject) => {
      console.log("in stats count")
      let current_date = new Date()
      let date = new Date(current_date.getTime() - 7 * 24 * 60 * 60 * 1000)
      console.log(date)
      order_model.aggregate([
        { $unwind: "$products"},
        { $match: { date: { $gte: new Date(date) }, "products.status" : {$eq: "Delivered"} } },
        { $project: {products : 1}},  
        { $sort: { _id: 1} }
      ]).then((data) => {
        console.log("stats delivered count",data.length)
        resolve(data?.length ? data.length : 0);
      })
    })
  },
  salesReport: () => {
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
                $dateToString: {
                  format: "%d/%m/%Y -- %H:%M",
                  date: "$date",
                  timezone: "+05:30",
                },
              },
            },
          },
          {
            $set: {
              productDetails: {
                $sortArray: { input: "$productDetails", sortBy: { _id: 1 } },
              },
            },
          },
          {
            $sort: { date: -1 },
          },
          
        ])
        .then((data) => {
          console.log("sales reports ",data[0]);
          resolve(data);
        });
    });
  },

};
