const { Types } = require("mongoose");
const products_model = require("../model/products_model");

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
      products_model.find().then((products) => {
        resolve(products);
      });
    });
  },
};
