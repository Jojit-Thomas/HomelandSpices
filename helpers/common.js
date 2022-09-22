const { Types, default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const products_model = require("../model/products_model");
const category_model = require("../model/category_model");
const user_model = require("../model/user_model");
const { generateBcrypt } = require("./bcrypt");
const createHttpError = require("http-errors");


module.exports = {
  getProduct: (productId) => {
    return new Promise((resolve, reject) => {
      if( mongoose.Types.ObjectId.isValid(productId)){
        products_model
          .findOne({ _id: Types.ObjectId(productId) })
          .then((product) => {
            product ? resolve(product) : reject(createHttpError.NotFound());//
          })
      } else {
        reject(createHttpError.NotFound());//If the provided productId is not a valid ObjectId
      }
    });
  },
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      products_model.aggregate([
        {$match:{ isDeleted: { $ne: true }} },
        {
          $set: {
            date: {
              $dateToString: { format: "%d/%m/%Y", date: "$date", timezone: "+05:30" },
            },
          },
        }
      ]).then((products) => {
        // console.log(products);
        resolve(products);
      });
    });
  },
  getAllCategories: () => {
    return new Promise((resolve, reject) => {
      category_model.find().then((category) => {
        resolve(category);
      });
    });
  },
  getCategory: (id) => {
    return new Promise((resolve, reject) => {
      console.log(id);
      products_model.find({ category: Types.ObjectId(id) }).then((category) => {
        console.log("IN category helper", category);
        resolve(category);
      });
    });
  },
  getUser: (userId) => {
    return new Promise((resolve, reject) => {
      if( mongoose.Types.ObjectId.isValid(userId)){
        user_model.findOne({ _id: Types.ObjectId(userId) }).then((user) => {
          user ? resolve(user) : reject(createHttpError.NotFound())// If the user does not exist, reject the request
        });
      } else {
        reject(createHttpError.NotFound());//If the provided userId is not a valid ObjectId, reject the request
      }
    });
  },
  updateUser: (id, body) => {
    return new Promise(async (resolve, reject) => {
      let { name, email, phone, password } = body;
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
        user_model
          .updateOne(
            { _id: Types.ObjectId(id) },
            {
              $set: {
                name: name,
                email: email,
                phone: phone,
                password: password,
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
  addToWallet: (userId, amount) => {
    return new Promise((resolve, reject) => {
      user_model.updateOne(
        { _id: Types.ObjectId(userId) },
        {
          $inc: { wallet: Number(amount) }, 
        }
      ).then((data) => {
        console.log(data);
        resolve();
      })
    });
  }, 
};
