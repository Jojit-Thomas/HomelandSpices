const { Types, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const products_model = require("../model/products_model");
const category_model = require("../model/category_model");
const coupon_model = require("../model/coupon_model");
const wallet_model = require("../model/wallet_model");
const user_model = require("../model/user_model");
const { generateBcrypt } = require("./bcrypt");
const createHttpError = require("http-errors");
const { CATEGORIES_COLLECTION } = require("../config/collections");

module.exports = {
  getProduct: (productId) => {
    return new Promise((resolve, reject) => {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        reject(createHttpError.NotFound()); //If the provided productId is not a valid ObjectId return an error not found
      }
      products_model
        .aggregate([
          { $match: { _id: Types.ObjectId(productId) } },
          {
            $lookup: {
              from: CATEGORIES_COLLECTION,
              localField: "category",
              foreignField: "_id",
              as: "category_details",
            },
          },
          // {
          //   $set: {
          //     total_discount: {$sum : [ "$category_details.discount", "$discount"]} // this does not work
          //   }
          // },
          {
            $set: {
              total_discount: { $sum: ["$category_details.discount"] },
            },
          },
          {
            $set: {
              total_discount: { $sum: ["$discount", "$total_discount"] },
            },
          },
        ])
        .then((product) => {
          product?.[0]
            ? resolve(product?.[0])
            : reject(createHttpError.NotFound()); //
        });
    });
  },
  getAllProducts: (offset = 0, limit = 100, sort = 1, sortValue = "date", deleted) => {
    return new Promise((resolve, reject) => {
      limit = parseInt(limit);
      offset = parseInt(offset);
      sort = parseInt(sort);
      let query = {};
      query[ sortValue.toLowerCase() ] = sort
      console.log(Boolean(deleted))
      products_model
        .aggregate([
          { $match: { isDeleted: Boolean(deleted) } },
          {
            $lookup: {
              from: CATEGORIES_COLLECTION,
              localField: "category",
              foreignField: "_id",
              as: "category_details",
            },
          },
          {
            $sort: query
          },
          {
            $skip : offset
          },
          {
            $limit: limit
          },
          {
            $set: {
              date: {
                $dateToString: {
                  format: "%d/%m/%Y",
                  date: "$date",
                  timezone: "+05:30",
                },
              },
            },
          },
        ])
        .then((products) => {
          resolve(products);
        });
    });
  },
  getAllCategories: () => {
    return new Promise((resolve, reject) => {
      category_model
        .aggregate([
          {
            $set: {
              date: {
                $dateToString: {
                  format: "%d/%m/%Y",
                  date: "$date",
                  timezone: "+05:30",
                },
              },
            },
          },
        ])
        .then((category) => {
          resolve(category);
        });
    });
  },
  getCategoryProduct: (id) => {
    return new Promise((resolve, reject) => {
      console.log(id);
      products_model.find({ category: Types.ObjectId(id) }).then((category) => {
        // console.log("IN category helper", category);
        resolve(category);
      });
    });
  },
  getUser: (userId) => {
    return new Promise((resolve, reject) => {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user_model.findOne({ _id: Types.ObjectId(userId) }).then((user) => {
          user ? resolve(user) : reject(createHttpError.NotFound()); // If the user does not exist, reject the request
        });
      } else {
        reject(createHttpError.NotFound()); //If the provided userId is not a valid ObjectId, reject the request
      }
    });
  },
  updateUser: (id, body) => {
    return new Promise(async (resolve, reject) => {
      let { name, email, phone, password, wallet } = body;
      let response = {};
      let user = await user_model.findOne({
        $and: [{ _id: { $ne: Types.ObjectId(id) } }, { email: email }],
      });

      if (user) {
        response.status = false;
        response.error = "Email already registered";
        resolve(response);
      } else {
        if (password) {
          password = await generateBcrypt(password);
        }
        console.log("Password is : ", password);
        user_model
          .updateOne(
            { _id: Types.ObjectId(id) },
            {
              $set: {
                name: name,
                email: email,
                phone: phone,
                password: password,
                wallet: Number(wallet),
                isAllowed: true,
              },
            }
          )
          .then((done) => {
            response.status = true;
            resolve(response);
          });
      }
    });
  },
  changePassword: (userId, password) => {
    return new Promise((resolve, reject) => {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        reject(createHttpError.NotFound()); //If the provided userId is not a valid ObjectId
      }
      user_model
        .updateOne(
          {
            _id: Types.ObjectId(userId),
          },
          {
            $set: {
              password: password,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  addToWallet: (userId, amount) => {
    return new Promise((resolve, reject) => {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        reject(createHttpError.NotFound()); //If the provided userId is not a valid ObjectId
      }
      user_model
        .updateOne(
          { _id: Types.ObjectId(userId) },
          {
            $inc: { wallet: Number(amount) },
          }
        )
        .then((data) => {
          resolve();
        });
    });
  },
  validateCoupon: (coupon) => {
    //parameters must be in uppercase letters
    return new Promise((resolve, reject) => {
      coupon_model.findOne({ coupon_code: coupon }).then((coupon) => {
        coupon ? resolve(coupon) : reject(createHttpError.Unauthorized("Invalid coupon code"));
      });
    });
  },
  incCoupon: (coupon) => {
    return new Promise((resolve, reject) => {
      coupon_model
        .updateOne(
          { coupon_code: coupon },
          {
            $inc: {
              total_coupon_used: 1,
            },
          }
        )
        .then((data) => {
          resolve();
        }).catch((err) => {
          console.log(err);
          reject(createHttpError.InternalServerError());
        })
    });
  },
  getAllWalletTransactions: (userId) => {
    return new Promise((resolve, reject) => {
      wallet_model.aggregate([
        {
          $match : {
            userId : Types.ObjectId(userId)
          }
        },
        {
          $set: {
            wallet : {
              $sortArray: {
                input: "$wallet",
                sortBy: {date : -1}
              }
            },
          }
        },
        // {
        //   $set: {
        //     wallet: {
        //       date: {
        //         $dateToString: {
        //           format: "%d/%m/%Y",
        //           date: "$date",
        //           timezone: "+05:30",
        //         },
        //       },
        //     }
        //   }
        // },
      ]).then((wallet) => {
        console.log(wallet);
        if(wallet[0]){
          total_credit = 0;
          total_debit = 0;
          wallet[0].wallet.forEach(wallet_history => {
            if(wallet_history.amount > 0) {
              total_credit += parseInt(wallet_history.amount)
            } else {
              total_debit += parseInt(wallet_history.amount)
            }
          });
          wallet[0].total_credit = total_credit;
          wallet[0].total_debit = total_debit;
          wallet[0].current_balance = total_credit - total_debit;
        }
        resolve(wallet[0]);
      })
    })
  },
  addWalletTransaction: (userId, title, amount) => {
    return new Promise(async (resolve, reject) => {
      let data = {
        title : title, 
        amount : Number(amount),
        date : new Date()
      }
      let wallet = await wallet_model.findOne({userId : Types.ObjectId(userId)})
      if(!wallet) {
        await wallet_model.create({userId: Types.ObjectId(userId), wallet : [data], date: new Date()})
        resolve();
      } else {
        await wallet_model.updateOne({userId: Types.ObjectId(userId)}, {
          $push: { wallet : data }
        })
        resolve();
      }
    })
  },
  getWalletBalance: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wallet = await user_model.findOne({_id: Types.ObjectId(userId)},{wallet : 1})
      resolve(wallet);
    })
  },
  getSearchProduct:async (keyword) => {
    return new Promise(async (resolve, reject) => {
      keyword = {$regex:'.*'+keyword+'.*',$options:'i'}
      let products = await products_model.find({title: keyword})
      console.log(products)
      resolve(products);
    })
  }
};
