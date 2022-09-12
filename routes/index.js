const express = require("express");
const { getNewAddressPage, getAddressPage, postAddressSelection, postNewAddress } = require("../controllers/user/address");

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
const { getPaymentPage } = require("../controllers/user/payment");
const {
  getAddToWishlist,
  getWishlistPage,
  getRemoveFromWishlist,
} = require("../controllers/user/wishlist");
const { getAddress } = require("../helpers/user/address");

// router.use((req, res, next) => {
//   res.setHeader("Cache-Control: no-cache, no-store, must-revalidate")
//   next();
// })

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});


//=========================AUTHENTICATION ROUTES =========================
router.get("/logout", verifyLogin, getLogout);
router.get("/signup", stopAuthenticate, getSignUp);
router.post("/signup", stopAuthenticate, postSignUp);
router.get("/signin", stopAuthenticate, getSignIn);
router.post("/signin", stopAuthenticate, postSignIn);
router.get("/blocked", stopAuthenticate, getBlocked);
router.post("/getOtp", stopAuthenticate, postGetOtp);
router.post("/verifyOtp", stopAuthenticate, postVerifyOtp);
router.get("/otpSigninPage", stopAuthenticate, getOtpSigninPage);
//=========================MAIN ROUTES =========================
router.get("/", verifyLogin, getHome);
router.get("/product/:id", verifyLogin, getProductPage);
//=========================CART ROUTES =========================
router.get("/cart", verifyLogin, getCartPage);
router.get("/cart/add/:proId", verifyLogin, getAddToCart);
router.post("/cart/remove", verifyLogin, getRemoveFromCart);
router.post("/cart/changeQuantity", verifyLogin, getCartChangeQuantity);
router.get("/categories/:categoryId", verifyLogin, getSortCategory);
//=========================WISHLIST ROUTES =========================
router.get("/wishlist", verifyLogin, getWishlistPage);
router.get("/wishlist/add/:productId", verifyLogin, getAddToWishlist); 
router.post("/wishlist/remove", verifyLogin, getRemoveFromWishlist);
//=========================ADDRESS ROUTES =========================
router.get("/address", verifyLogin, getAddressPage);
router.post("/address", verifyLogin, postAddressSelection) 
router.get("/address/add", verifyLogin, getNewAddressPage);
router.post("/address/add", verifyLogin, postNewAddress);
//=========================ORDER ROUTES =========================
router.get("/orders", verifyLogin, getOrderPage);
router.get("/order/cancel/:orderId/:productId", verifyLogin, getCancelProduct);
router.get("/orders/details/:orderId/:productId", verifyLogin, getOrderDetailsPage);
router.get("/payment", verifyLogin, getPaymentPage)
router.post("/checkout", verifyLogin, postCheckout);

module.exports = router;
