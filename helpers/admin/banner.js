const { Types } = require("mongoose");
const banner_model = require("../../model/banner_model");
module.exports = {
  getAllBanners: () => {
    return new Promise((resolve, reject) => {
        banner_model.find().sort({position: 1}).then((banners) => {
          resolve(banners);
        })
    });
  },
  addBannerImage: (product, img_name, img_ext) => {
    const { title } = product;
    return new Promise((resolve, reject) => {
      console.log(product);
      try {
        banner_model
          .create({
            title: title,
            img_ext: img_ext,
            img_name: img_name,
            position: Number(Math.floor(Math.random() * 100)),
          })
          .then((result) => {
            resolve(result);
          });
      } catch (err) {
        console.log(err);
      }
    });
  },
  editPosition: (productId, position) => {
    return new Promise((resolve, reject) => {
      try{
        banner_model.updateOne({
          _id: Types.ObjectId(productId),
        },
        {
          $set: {
            position: position,
          }
        }).then(() => {
          resolve();
        })
      } catch (err) {
        next(err);
      }
    })
  },
  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      try {
        banner_model.deleteOne({
          _id: Types.ObjectId(bannerId),
        }).then((log) => {
          console.log("delted",log);
          resolve();
        })
      }catch (err) {
        next(err);
      }
    })
  },
  getBannerDetails: (bannerId) => {
    return new Promise((resolve, reject) => {
      try {
        banner_model.findOne({_id: Types.ObjectId(bannerId)}).then((banner) => {
          resolve(banner);
        })
      } catch (err) {
        next(err);
      }
    })
  }
};
