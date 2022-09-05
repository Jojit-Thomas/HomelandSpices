const { Types } = require("mongoose");
const products_model = require("../model/products_model");
const address_model = require("../model/address_model");
const wishlist_model = require("../model/wishlist_model");

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
  getAllProducts: (userId) => {
    return new Promise((resolve, reject) => {
      products_model.find({isDeleted : {$ne: true}}).then((products) => {
        console.log(products);
        resolve(products);
      });
    });
  },
  addAddress: (body) => {
    return new Promise((resolve, reject) => {
      const { name, phone, locality, city, address } = body;
      let addressObj = { 
        name: name,
        phone: phone,
        locality: locality,
        city: city,
        address: address,
      };
      address_model.create(addressObj).then((state) => {
        resolve(state);
      });
    });
  },
};
