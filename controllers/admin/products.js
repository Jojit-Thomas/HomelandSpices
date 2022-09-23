const fs = require("fs");
const path = require("path");
const {
  AddProduct,
  deleteProduct,
  updateProduct,
} = require("../../helpers/admin/products");
const { getAllProducts, getProduct, getAllCategories } = require("../../helpers/common");
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
    // getProduct(req.params.id).then((result) => {
    //   console.log(result);
    //   fs.unlinkSync(
    //     path.join( 
    //       __dirname,
    //       `../../public/product_images/${req.params.id}.${result.img_ext}`
    //     )
    //   );
    // });
    //soft delete the product 
    deleteProduct(req.params.id).then((result) => {
      if (result) {
        res.status(200).json({success: true});
      } else {
        res.status().json("something went wrong");
      }
    });
  },
  getEditProduct: (req, res, next) => {
    getProduct(req.params.id).then(async (result) => {
        let categories = await getAllCategories()
        res.render("admin/edit_product", { admin: true, product: result,categories: categories });
    }).catch((err) => {
      next(err);
    })
    
  },
  postEditProduct: (req, res) => {
    if(req.files) { // check if the image is changed
      var img_ext = req.files?.image.name.split(".").pop(); // getting the file extension of the old file
    }
      let {max_price, discount } = req.body; 
    req.body.price = Math.round(max_price - ( discount / 100) * max_price)
    console.log(req.body.price)
    updateProduct(req.params.id, req.body, img_ext).then((result) => {
      console.log(result);
      if (result) {
        // if image is changed add new image to the folder
        if (req.files) {
          const image = req.files?.image;
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
