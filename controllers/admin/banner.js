const { addBannerImage, getAllBanners } = require("../../helpers/admin/banner");
const randomstring = require("randomstring");

module.exports = {
  getBannerPage: (req, res) => {
    getAllBanners().then((banners) => {
      res.render("admin/view_banners", {
        admin: true,
        banners: banners,
      });
    });
  },
  getAddBanner: (req, res) => {
    res.render("admin/add_banners", {
      admin: true,
    });
  },

  postAddBanner: (req, res) => {
    const img_ext = req.files?.image?.name.split(".").pop(); // to get the extension of the file
    const img_name = randomstring.generate();
    console.log(img_name);
    addBannerImage(req.body, img_name, img_ext).then(() => {
      const image = req.files?.image;
      image.mv(
        `./public/banners/${img_name}.${img_ext}`, // adding image of product to the product images file
        (err, done) => {
          if (!err) res.redirect("/admin/banners");
          else console.log(err);
        }
      );
    });
  },
};
