const {
  getAllProducts,
  getProduct,
  getAllCategories,
  getCategoryProduct,
  getWalletBalance,
  getSearchProduct,
} = require("../../helpers/common");
const { getAddress } = require("../../helpers/user/address");
const { getBannerImage } = require("../../helpers/user/banners");
const { getTotalAmount } = require("../../helpers/user/cart");
const { getAllWishlist } = require("../../helpers/user/wishlist");

module.exports = {
  getHome: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    console.log("user", user);
    let products = await getAllProducts();
    console.log("products", products);
    let banner = await getBannerImage();
    console.log("banner", banner);
    let categories = await getAllCategories();
    console.log("categories", categories);
    // for(x in products) //On^2
    //   if(x in wishlist)
    let wishlist;
    if(user) {
      wishlist = await getAllWishlist(user.userId);
      console.log(wishlist);
      if(wishlist[0]) {
        products.forEach(product => {
          wishlist[0].wishlistItems.forEach(wishlistItem => {
            if(product._id.toString() == wishlistItem.toString()) {
              product.wishlist = true;
              console.log(product)
            }
          });
        });
        console.log("wishlist", wishlist);
      }
    }
    console.log("all set")
      // console.log(wishlist[0]);
    res.render("user/home", {
      title: "Homeland Spices",
      products: products,
      user: user,
      banner: banner,
      wishlist: wishlist ? wishlist[0] : undefined,
      categories: categories,
    });
  },
  getProductPage: async (req, res, next) => {
    console.log("Referer : ",req.headers['referer'])
    try{
      let product = await getProduct(req.params.id)
      let user = req.cookies.user ? req.cookies.user : null;
      res.render("user/product_detail_view", { product: product, user: user });
    } catch(err) {
      next(err)
    }
  },
  getSortCategory: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let products = await getCategoryProduct(req.params.categoryId)
    let categories = await getAllCategories()
    let wishlist;
    if(user) { // if user is logged in show heart on wishlist items
      wishlist = await getAllWishlist(user.userId);
      console.log(wishlist);
      if(wishlist[0]) {
        products.forEach(product => {
          wishlist[0].wishlistItems.forEach(wishlistItem => {
            if(product._id.toString() == wishlistItem.toString()) {
              product.wishlist = true;
              console.log(product)
            }
          });
        });
      }
    }
    res.render("user/shop", { products: products, categories : categories, user: user });

  },
  getShopPage: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let products = await getAllProducts();
    let categories = await getAllCategories()
    let wishlist;
    if(user) {
      wishlist = await getAllWishlist(user.userId);
      console.log(wishlist);
      if(wishlist[0]) {
        products.forEach(product => {
          wishlist[0].wishlistItems.forEach(wishlistItem => {
            if(product._id.toString() == wishlistItem.toString()) {
              product.wishlist = true;
              console.log(product)
            }
          });
        });
      }
    }
    res.render("user/shop", { user: user, products: products, categories: categories });
  },
 validateWallet: async (req, res) => {
  let user = req.cookies.user ? req.cookies.user : null;
  let order = await getTotalAmount(user.userId);
  let user_wallet = await getWalletBalance(user.userId)
  if(user_wallet.wallet < order.total_amount) {
    res.status(401).json({
      error : "insufficient_wallet",
      message : "Insufficient balance in wallet"
    })
  } else {
    res.status(200).json("Wallet amount validation success")
  }
 },
 getSearch: async (req, res) => {
  let user = req.cookies.user ? req.cookies.user : null;
  let products = await  getSearchProduct(req.query.search)
  let categories = await getAllCategories()
    let wishlist;
    if(user) {
      wishlist = await getAllWishlist(user.userId);
      console.log(wishlist);
      if(wishlist[0]) {
        products.forEach(product => {
          wishlist[0].wishlistItems.forEach(wishlistItem => {
            if(product._id.toString() == wishlistItem.toString()) {
              product.wishlist = true;
              console.log(product)
            }
          });
        });
      }
    }
  res.render("user/shop", { user: user, products: products, categories: categories });
 }
};
