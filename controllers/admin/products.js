const fs = require("fs");
const path = require("path");
const { getAllCategories } = require("../../helpers/admin/categories");
const {
  AddProduct,
  deleteProduct,
  updateProduct,
} = require("../../helpers/admin/products");
const { getAllProducts, getProduct } = require("../../helpers/common");
module.exports = {
  getProducts: (req, res) => {
    getAllProducts().then((products) => {
      res.render("admin/view_products", { admin: true, products: products });
    });
  },
  getAddProducts: (req, res) => {
    getAllCategories().then((categories) => {
      console.log(categories);
      res.render("admin/add_product", { admin: true, categories: categories });
    });
  },
  postAddProducts: (req, res) => {
    const img_ext = req.files.image.name.split(".").pop(); // to get the extension of the file
    AddProduct(req.body, img_ext).then((result) => {
      console.log(result);
      if (result) {
        const image = req.files.image;
        image.mv(
          `./public/product_images/${result._id}.${result.img_ext}`, // adding image of product to the product images file
          (err, done) => {
            if (!err) res.redirect("/admin/products");
            else console.log(err);
          }
        );
      } else {
        console.log("error");
      }
    });
  },
  deleteProduct: (req, res) => {
    getProduct(req.params.id).then((result) => {
      console.log(result);
      fs.unlinkSync(
        path.join(
          __dirname,
          `../../public/product_images/${req.params.id}.${result.img_ext}`
        )
      );
    });
    deleteProduct(req.params.id).then((result) => {
      if (result) {
        res.redirect("/admin/products");
      } else {
        res.send("something went wrong");
      }
    });
  },
  getEditProduct: (req, res) => {
    getProduct(req.params.id).then((result) => {
      if (result) {
        res.render("admin/edit_product", { admin: true, product: result });
      } else {
        res.send("Unable to find a product");
      }
    });
  },
  postEditProduct: (req, res) => {
    // check if the image is changed
    if (req.files) {
      try {
        // if changed delete old image
        fs.unlinkSync(
          path.join(
            __dirname,
            `../../public/product_images/${req.params.id}.${req.query.img_ext}`
          )
        );
        console.log("File is deleted.");
      } catch (error) {
        console.log(error);
      }
      var img_ext = req.files.image.name.split(".").pop(); // getting the file extension of the old file
    }
    updateProduct(req.params.id, req.body, img_ext).then((result) => {
      console.log(result);
      if (result) {
        // if image is changed add new image to the folder
        if (req.files) {
          const image = req.files.image;
          image.mv(
            `./public/product_images/${req.params.id}.${img_ext}`,
            (err, done) => {
              if (!err) res.redirect("/admin/products");
              else console.log(err);
            }
          );
        }
        //if image not changed redirect to products
        else {
          res.redirect("/admin/products");
        }
      } else {
        res.send("Unable to complete your request");
      }
    });
  },
};
