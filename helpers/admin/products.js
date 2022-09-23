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
            category: Types.ObjectId(category),
            price: Number(price),
            stocks: Number(stocks),
            img_ext: img_ext,
            isDeleted: false,
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
        .updateOne({ _id: Types.ObjectId(productId) },{ isDeleted: true})
        .then((result) => {
          resolve(result);
        });
    });
  },
  updateProduct: (productId, body, img_ext) => {
    const { title, description, category, price, stocks, max_price, discount } = body;
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
            stocks: Number(stocks),
            img_ext: img_ext,
            price: Number(price),
            max_price : Number(max_price),
            discount: Number(discount),
          },
        }
      ).then((result) => {
        resolve(result);
      })
    });
  },
};
