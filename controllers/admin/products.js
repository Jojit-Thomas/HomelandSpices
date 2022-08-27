const {
  AddProduct,
  getAllProducts,
  deleteProduct,
  getProduct,
  updateProduct,
} = require("../../helpers/admin/products");
module.exports = {
  getProducts: (req, res) => {
    getAllProducts().then((products) => {
      res.render("admin/products", { admin: true, products: products });
    });
  },
  getAddProducts: (req, res) => {
    res.render("admin/add_product", { admin: true });
  },
  postAddProducts: (req, res) => {
    const img_ext = req.files.image.name.split(".").pop();
    AddProduct(req.body, img_ext).then((result) => {
      console.log(result);
      if (result) {
        const image = req.files.image;
        image.mv(
          `./public/product_images/${result._id}.${result.img_ext}`,
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
    console.log(req.query.img_ext);
    try {
      fs.unlinkSync();

      console.log("File is deleted.");
    } catch (error) {
      console.log(error);
    }
    const img_ext = req.files.image.name.split(".").pop();
    updateProduct(req.params.id, img_ext).then((result) => {
      if (result) {
        res.redirect("/admin/products");
      } else {
        res.send("Unable to complete your request");
      }
    });
  },
};
