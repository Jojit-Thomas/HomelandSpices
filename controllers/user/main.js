const { getAllProducts, getProduct } = require("../../helpers/common");
const { getBannerImage } = require("../../helpers/user/banners");

module.exports = {
  getHome: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;

    getAllProducts(user.userId).then((products) => {
      getBannerImage().then((banner) => {
        res.render("user/home", {
          title: "Homeland Spices",
          products: products,
          user: user,
          banner: banner
        });
      });
    });
  },
  getProductPage: (req, res) => {
    getProduct(req.params.id).then((product) => {
      let user = req.cookies.user ? req.cookies.user : null;
      res.render("user/product_detail_view", { product: product, user: user });
    });
  },
  getSortCategory: (req, res) => {
    user = req.session.user;
    getCategory(req.params.categoryId).then((products) => {
      getAllCategories().then((categories) => {
        res.render("user/shop", { products: products, categories, user });
      });
    });
  },
};
