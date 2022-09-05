const express = require("express");

const {
  getSignIn,
  getSignUp,
  postSignIn,
  postSignUp,
  stopAuthenticate,
  getBlocked,
  getLogout,
  getOtpSigninPage,
  postGetOtp,
  postVerifyOtp,
  verifyLogin,
} = require("../controllers/user/authentication");
const {
  getAddToCart,
  getCartPage,
  getCartChangeQuantity,
  getRemoveFromCart,
} = require("../controllers/user/cart");
const {
  getHome,
  getProductPage,
  getSortCategory,
} = require("../controllers/user/main");
const router = express.Router();

const {
  getCheckoutPage,
  postCheckout,
  getOrderPage,
  getOrderDetailsPage,
  getCancelProduct,
} = require("../controllers/user/orders");
const { getAddToWishlist, getWishlistPage, getRemoveFromWishlist } = require("../controllers/user/wishlist");

// router.use((req, res, next) => {
//   res.setHeader("Cache-Control: no-cache, no-store, must-revalidate")
//   next();
// })

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* Authentication routes */
router.get("/signin", stopAuthenticate, getSignIn);
router.post("/signin", stopAuthenticate, postSignIn);
router.get("/signup", stopAuthenticate, getSignUp);
router.post("/signup", stopAuthenticate, postSignUp);
router.get("/blocked", stopAuthenticate, getBlocked);
router.get("/otpSigninPage", stopAuthenticate, getOtpSigninPage);
router.post("/getOtp", stopAuthenticate, postGetOtp);
router.post("/verifyOtp", stopAuthenticate, postVerifyOtp);



// Main Routes

router.get("/", verifyLogin, getHome);
router.get("/product/:id", verifyLogin, getProductPage);
router.get("/cart/:userId", verifyLogin, getCartPage);
router.get("/cart/add/:userId/:proId", verifyLogin, getAddToCart);
router.post("/cart/changeQuantity", verifyLogin, getCartChangeQuantity);
router.post("/cart/remove", verifyLogin, getRemoveFromCart);
router.get("/checkout", verifyLogin, getCheckoutPage);
router.post("/checkout", verifyLogin, postCheckout);
router.get("/orders", verifyLogin, getOrderPage);
// router.get("/order/details/:id", verifyLogin, getOrderDetailsPage);
router.get("/order/cancel/:orderId/:productId", verifyLogin, getCancelProduct);
router.get("/categories/:categoryId", verifyLogin, getSortCategory);
router.get("/wishlist", verifyLogin, getWishlistPage);
router.get("/wishlist/add/:productId", verifyLogin, getAddToWishlist)
router.post("/wishlist/remove", verifyLogin, getRemoveFromWishlist)
router.get("/logout", verifyLogin, getLogout);

module.exports = router;
