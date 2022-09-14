const { Types } = require("mongoose");
const products_model = require("../model/products_model");
const category_model = require("../model/category_model");

module.exports = {
  getProduct: (productId) => {
    return new Promise((resolve, reject) => {
      products_model
        .findOne({ _id: Types.ObjectId(productId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  getAllProducts: () => {
    return new Promise((resolve, reject) => {
      products_model.find({ isDeleted: { $ne: true } }).then((products) => {
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
      console.log(id)
      products_model.find({category: Types.ObjectId(id)}).then((category) => {
        console.log("IN category helper",category);
        resolve(category);
      })
    })
  },
};
