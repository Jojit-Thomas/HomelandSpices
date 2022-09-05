const banner_model = require("../../model/banner_model");
module.exports = {
  getAllBanners: () => {
    return new Promise((resolve, reject) => {
        banner_model.find().then((banners) => {
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
};
