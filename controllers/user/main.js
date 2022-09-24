const {
  getAllProducts,
  getProduct,
  getAllCategories,
  getUser,
  getCategoryProduct,
} = require("../../helpers/common");
const { getAddress } = require("../../helpers/user/address");
const { getBannerImage } = require("../../helpers/user/banners");
const { getAllWishlist } = require("../../helpers/user/wishlist");

module.exports = {
  getHome: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let products = await getAllProducts();
    let banner = await getBannerImage();
    let wishlist = await getAllWishlist(user.userId);
    let categories = await getAllCategories();
    // for(x in products) //On
    //   if(x in wishlist)//On
    console.log(wishlist[0]);
    res.render("user/home", {
      title: "Homeland Spices",
      products: products,
      user: user,
      banner: banner,
      wishlist: wishlist[0],
      categories: categories,
    });
  },
  getProductPage: (req, res, next) => {
    console.log(req.headers['referer'])
    getProduct(req.params.id).then((product) => {
      let user = req.cookies.user ? req.cookies.user : null;
      console.log(product)
      res.render("user/product_detail_view", { product: product, user: user });
    }).catch((err) => {
      next(err)
    })
  },
  getSortCategory: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    getCategoryProduct(req.params.categoryId).then((products) => {
      getAllCategories().then((categories) => {
        res.render("user/shop", { products: products, categories, user });
      });
    });
  },
  getShopPage: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let products = await getAllProducts();
    let categories = await getAllCategories()
    res.render("user/shop", { user: user, products: products, categories: categories });
  },
};
