const products_model = require("../../model/products_model");
const { Types } = require("mongoose");
module.exports = {
  AddProduct: (product, img_ext) => {
    const { title, description, category, price, stocks } = product;
    return new Promise((resolve, reject) => {
      console.log(product);
      try {
        products_model
          .create({
            title: title,
            desc: description,
            category: category,
            price: Number(price),
            stocks: Number(stocks),
            img_ext: img_ext,
          })
          .then((result) => {
            resolve(result);
          });
      } catch (err) {
        console.log(err);
      }
    });
  },
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      products_model
        .deleteOne({ _id: Types.ObjectId(productId) })
        .then((result) => {
          resolve(result);
        });
    });
  },
  updateProduct: (productId, body, img_ext) => {
    const { title, description, category, price, stocks } = body;
    console.log(stocks)
    console.log(Number(stocks))
    return new Promise((resolve, reject) => {
      products_model.updateOne(
        { _id: Types.ObjectId(productId) },
        {
          $set: {
            title: title,
            desc: description,
            category: category,
            price: Number(price),
            stocks: Number(stocks),
            img_ext: img_ext,
          },
        }
      ).then((result) => {
        resolve(result);
      })
    });
  },
};
