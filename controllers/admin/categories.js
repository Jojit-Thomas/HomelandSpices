const createHttpError = require("http-errors");
const {
  AddCategory,
  deleteCategory,
  getCategoryById,
  editCategory,
  isCategoryExist,
} = require("../../helpers/admin/categories");
const {
  getAllCategories,
  getCategoryProduct,
} = require("../../helpers/common");
const fs = require("fs");
const path = require("path");
const { editCategoryDiscount } = require("../../helpers/admin/products");
const { VerificationAttemptsSummaryContext } = require("twilio/lib/rest/verify/v2/verificationAttemptsSummary");

module.exports = {
  getCategoriesPage: (req, res) => {
    getAllCategories().then((categories) => {
      res.render("admin/view_categories", {
        admin: true,
        categories: categories,
      });
    });
  },
  getAddCategory: (req, res) => {
    res.render("admin/add_category", { admin: true });
  },
  postAddCategory: async (req, res, next) => {
    let { name, desc, discount } = req.body;
    name = name.trim();
    try {
      let exist = await isCategoryExist(name);
      var img_ext = req.files?.image.name.split(".").pop(); // getting the file extension of the old file & if image exists
      let { _id } = await AddCategory(name, desc, img_ext, discount);
      if (req.files) {
        const image = req.files.image;
        image.mv(`./public/categories/${_id}.${img_ext}`, (err, done) => {
          if (!err) res.redirect("/admin/category");
          else {
            console.log(err);
            reject(createHttpError.InternalServerError());
          }
        });
      } else {
        res.redirect("/admin/category");
      }
    } catch (err) {
      next(err);
    }
  },
  getDeleteCategory: (req, res, next) => {
    const { categoryId } = req.params;
    // Deleting the image of the category
    getCategoryById(categoryId).then((result) => {
      fs.unlink(
        path.join(
          __dirname,
          `../../public/categories/${categoryId}.${result.img_ext}`
        ),
        async (err) => {
          if (err) {
            next(createHttpError.InternalServerError());
          } else {
            console.log("success");
            await deleteCategory(categoryId);
            res.redirect("/admin/category");
          }
        }
      );
    });
  },
  getEditCategory: async (req, res, next) => {
    try{
      let category = await getCategoryById(req.params.categoryId)
      res.render("admin/edit_category", { category: category });
    } catch (err) {
      next(err)
    }
  },
  postEditCategory: async (req, res, next) => {
    let { name, desc, discount } = req.body;
    const { categoryId } = req.params;
    try {
      name = name.trim(); // Removing white spaces to make sure the manipulation of unique category names
      await isCategoryExist(name, categoryId); // Assuring the category name is unique
      if (req.files) {
        // If Image is changed, delete the old image from the file
        getCategoryById(categoryId).then((result) => {
          console.log(result);
          fs.unlinkSync(
            path.join(
              __dirname,
              `../../public/categories/${categoryId}.${result.img_ext}`
            )
          );
        });
      }
      var img_ext = req.files?.image.name.split(".").pop(); // getting the file extension  of the old file & if image exists
      await editCategory(categoryId, name, desc, img_ext, discount);
      let categoryProducts = await getCategoryProduct(categoryId); //get all products with this categoryId
      categoryProducts.forEach(async (products) => {
        cd_price = Math.round(
          Number(products.pd_price - (products.pd_price * discount) / 100)
        ); // calculating the final discounted price by subtracting the discount% from the product discounted price
        let one_per_cent = Number(products.max_price) / 100// One per cent of MRP 
        total_discount = Math.round(( Number(products.max_price) - Number(cd_price) ) / Number(one_per_cent))// (MRP - Category discount price) / one per cent of MRP
        //productId :  new ObjectId("6321cb3cc29016ee2b12dfa3") cd_price :  94 total_discount :  6
        //productId :  new ObjectId("6321cb48c29016ee2b12dfa8") cd_price :  48 total_discount :  5
        //productId :  new ObjectId("6321cb5dc29016ee2b12dfad") cd_price :  128 total_discount :  8
        await editCategoryDiscount(products._id, cd_price, total_discount); // Updating category discount price and total discount in every product with this category
      });
      await editCategoryDiscount(categoryId, discount); // Also updating category discount % in category collection
      if (req.files) {
        const image = req.files.image;
        image.mv(
          `./public/categories/${categoryId}.${img_ext}`,
          (err, done) => {
            if (!err) res.redirect("/admin/category");
            else {
              console.log(err);
              reject(createHttpError.InternalServerError());
            }
          }
        );
      } else {
        res.redirect("/admin/category");
      }
    } catch (err) {
      next(err);
    }
  },
};
