const express = require("express");
const { getNewAddressPage, getAddressPage, postAddressSelection, postNewAddress, getDeleteAddress, getNewUserAddressPage } = require("../controllers/user/address");

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
  getForgotPasswordPage,
  forgotPassword,
  resetForgotPasswordPage,
  resetForgotPassword,
} = require("../controllers/user/authentication");
const {
  getAddToCart,
  getCartPage,
  getCartChangeQuantity,
  getRemoveFromCart,
  getCheckStock,
  getCartTotalAmount,
} = require("../controllers/user/cart");
const {
  getHome,
  getProductPage,
  getSortCategory,
  getShopPage,
  validateWallet,
} = require("../controllers/user/main");
const router = express.Router();

const {
  postCheckout,
  getOrderPage,
  getOrderDetailsPage,
  getCancelProduct,
} = require("../controllers/user/orders");
const { getPaymentPage, verifyPayment } = require("../controllers/user/payment");
const { getProfilePage, postEditUser, postChangePassword, getChangePassword, getWalletHistory } = require("../controllers/user/user");
const {
  getAddToWishlist,
  getWishlistPage,
  getRemoveFromWishlist,
} = require("../controllers/user/wishlist");

const paypal = require("../controllers/paypal");
const { getTotalAmount } = require("../helpers/user/cart");
const { validateCoupon } = require("../controllers/coupon");

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
router.get("/otp", stopAuthenticate, getOtpSigninPage);
router.post("/otp/get", stopAuthenticate, postGetOtp);
router.post("/otp/verify", stopAuthenticate, postVerifyOtp);
router.get("/password/forgot", getForgotPasswordPage);
router.post("/password/forgot", forgotPassword);
router.get("/password/forgot/:token", resetForgotPasswordPage)
router.post("/password/forgot/reset", resetForgotPassword)
//=========================MAIN ROUTES =========================
router.get("/", getHome);
router.get("/product/:id", getProductPage);
router.get("/shop", verifyLogin, getShopPage)
router.get("/user/profile", verifyLogin, getProfilePage)
router.post("/user/edit", verifyLogin, postEditUser)
router.get("/user/password/reset", verifyLogin, getChangePassword)
router.post("/user/password/reset", verifyLogin, postChangePassword)
router.get("/wallet/history", verifyLogin, getWalletHistory)
//=========================CART ROUTES =========================
router.get("/cart", verifyLogin, getCartPage);
router.post("/cart/add", verifyLogin, getAddToCart);
router.post("/cart/remove", verifyLogin, getRemoveFromCart);
router.post("/cart/changeQuantity", verifyLogin, getCartChangeQuantity);
router.get("/cart/total", verifyLogin, getCartTotalAmount)
router.get("/categories/:categoryId", verifyLogin, getSortCategory); 
router.get("/checkStock", verifyLogin, getCheckStock);
//=========================WISHLIST ROUTES =========================
router.get("/wishlist", verifyLogin, getWishlistPage);
router.post("/wishlist/add", verifyLogin, getAddToWishlist); 
router.post("/wishlist/remove", verifyLogin, getRemoveFromWishlist);
//=========================ADDRESS ROUTES =========================
router.get("/address", verifyLogin, getAddressPage);
router.post("/address", verifyLogin, postAddressSelection);
router.get("/address/add", verifyLogin, getNewAddressPage);
router.get("/user/address/add", verifyLogin, getNewUserAddressPage);
router.post("/address/add", verifyLogin, postNewAddress);
router.delete("/address/delete/:id", verifyLogin, getDeleteAddress)
//=========================ORDER ROUTES =========================
router.get("/orders", verifyLogin, getOrderPage);
router.get("/orders/cancel/:orderId/:productId", verifyLogin, getCancelProduct);
router.get("/orders/details/:orderId/:productId", verifyLogin, getOrderDetailsPage);
router.get("/payment", verifyLogin, getPaymentPage)
router.post("/checkout", verifyLogin, postCheckout);
router.post("/payment/verify", verifyLogin, verifyPayment);
router.get("/coupon/validate/:couponId", verifyLogin, validateCoupon)
router.get("/wallet/validate", verifyLogin, validateWallet)

router.post("/api/orders", async (req, res) => {
  try {
    let user = req.cookies.user ? req.cookies.user : null;
    let total = await getTotalAmount(user.userId);
    const order = await paypal.createOrder(total.total_amount);
    console.log(order);
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/api/orders/:orderID/capture", async (req, res) => {
  const { orderID } = req.params;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});




module.exports = router;
