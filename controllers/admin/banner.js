const {
  addBannerImage,
  getAllBanners,
  editPosition,
  deleteBanner,
  getBannerDetails,
} = require("../../helpers/admin/banner");
const randomstring = require("randomstring");
const fs = require("fs");
const path = require("path");

module.exports = {
  getBannerPage: (req, res, next) => {
    // the banners are sorted in ascending order based on position
    getAllBanners().then((banners) => {
      res.render("admin/view_banners", {
        admin: true,
        banners: banners,
      });
    });
  },
  getAddBanner: (req, res, next) => {
    res.render("admin/add_banners", {
      admin: true,
    });
  },

  postAddBanner: (req, res, next) => {
     // to get the extension of the file , .jpg, .png, etc
    const img_ext = req.files?.image?.name.split(".").pop();
    const img_name = randomstring.generate(); 
    // title, image name, ext and position is stored in db
    addBannerImage(req.body, img_name, img_ext).then(() => { 
      const image = req.files?.image;
      // adding banner image to public/banners folder
      image.mv(
        `./public/banners/${img_name}.${img_ext}`, 
        (err, done) => {
          if (!err) res.redirect("/admin/banners");
          else console.log(err);
        }
      );
    });
  },
  postEditPosition: (req, res, next) => {
    const { bannerId, position } = req.body;
    // Edit the position of th banner 
    // the position is sorted in ascending order in the home screen
    editPosition(bannerId, position).then(() => {
      res.send("updated successfully");
    });
  },
  getdeleteBanner: async (req, res, next) => {
    const { bannerId } = req.params;
    // fetching the name of the file for deletion
    let banner = await getBannerDetails(bannerId);
    const { img_name, img_ext } = banner;
    // deleting the banner image using fs module
    try {
       fs.unlinkSync(
        path.join(__dirname, `../../public/banners/${img_name}.${img_ext}`)
      );
    } catch (err) {
      next(err);
    }
    // deleting the banner details from the database
    deleteBanner(bannerId).then(() => {
      res.redirect("/admin/banners");
    });
  },
};
