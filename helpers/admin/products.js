const products_model = require("../../model/products_model");
const { Types } = require("mongoose");
module.exports = {
  AddProduct: (product, img_ext) => {
    const { title, description, category, max_price, cd_price, pd_price, stocks, discount } = product;
    return new Promise((resolve, reject) => {
      console.log(product);
      try {
        products_model
          .create({
            title: title,
            desc: description,
            category: Types.ObjectId(category),
            max_price: Number(max_price),
            cd_price: Number(cd_price),
            pd_price: Number(pd_price),
            stocks: Number(stocks),
            discount: Number(discount),
            img_ext: img_ext,
            isDeleted: false,
          })
          .then((result) => {
            resolve(result)
          });
      } catch (err) {
        console.log(err);
      }
    });
  },
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      products_model
        .updateOne({ _id: Types.ObjectId(productId) }, { isDeleted: true })
        .then((result) => {
          resolve(result);
        });
    });
  },
  updateProduct: (productId, body, img_ext) => {
    const { title, description, category, pd_price, cd_price, stocks, max_price, discount } =
      body;
    console.log(stocks);
    console.log(Number(stocks));
    return new Promise((resolve, reject) => {
      products_model
        .updateOne(
          { _id: Types.ObjectId(productId) },
          {
            $set: {
              title: title,
              desc: description,
              category: category,
              stocks: Number(stocks),
              img_ext: img_ext,
              pd_price: Number(pd_price),
              cd_price: Number(cd_price),
              max_price: Number(max_price),
              discount: Number(discount),
              total_discount: Number(total_discount),
            },
          }
        )
        .then((result) => {
          resolve(result);
        });
    });
  },
  editCategoryDiscount: (productId, cd_price, total_discount) => {
    console.log('productId : ' , productId, 'cd_price : ' , cd_price, 'total_discount : ' , total_discount);
    //productId :  new ObjectId("6321cb3cc29016ee2b12dfa3") cd_price :  94 total_discount :  6
    //productId :  new ObjectId("6321cb48c29016ee2b12dfa8") cd_price :  48 total_discount :  5
    //productId :  new ObjectId("6321cb5dc29016ee2b12dfad") cd_price :  128 total_discount :  8
    //productId :  632edf62691e356cddae627d cd_price :  5 total_discount :  undefined
    return new Promise((resolve, reject) => {
      products_model.updateMany(
        { _id: Types.ObjectId(productId) },
        { $set: { cd_price: Number(cd_price), total_discount: total_discount } }
      ).then((data) => {
        console.log(data);
        resolve();
      }).catch((err) => {console.log(err);})
    })
  },
  getProductCount: () => {
    return new Promise((resolve, reject) => {
      products_model.countDocuments().then((count) => {
        console.log(count);
        resolve(count);
      })
    })
  }
};
