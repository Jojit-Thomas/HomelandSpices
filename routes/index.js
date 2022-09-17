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
  getShopPage,
} = require("../controllers/user/main");
const router = express.Router();

const {
  postCheckout,
  getOrderPage,
  getOrderDetailsPage,
  getCancelProduct,
} = require("../controllers/user/orders");
const { getPaymentPage, verifyPayment, verifyPaymentController } = require("../controllers/user/payment");
const { getProfilePage, postEditUser, postChangePassword, getChangePassword } = require("../controllers/user/user");
const {
  getAddToWishlist,
  getWishlistPage,
  getRemoveFromWishlist,
} = require("../controllers/user/wishlist");

const paypal = require("../controllers/paypal");
const { getTotalAmount } = require("../helpers/user/cart");

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
router.post("/otp/get", stopAuthenticate, postGetOtp);
router.post("/verifyOtp", stopAuthenticate, postVerifyOtp);
router.get("/otpSigninPage", stopAuthenticate, getOtpSigninPage);
//=========================MAIN ROUTES =========================
router.get("/", verifyLogin, getHome);
router.get("/product/:id", verifyLogin, getProductPage);
router.get("/shop", verifyLogin, getShopPage)
router.get("/user/profile", verifyLogin, getProfilePage)
router.post("/user/edit", verifyLogin, postEditUser)
router.get("/user/password/reset", verifyLogin, getChangePassword)
router.post("/user/password/reset", verifyLogin, postChangePassword)
//=========================CART ROUTES =========================
router.get("/cart", verifyLogin, getCartPage);
router.post("/cart/add", verifyLogin, getAddToCart);
router.post("/cart/remove", verifyLogin, getRemoveFromCart);
router.post("/cart/changeQuantity", verifyLogin, getCartChangeQuantity);
router.get("/categories/:categoryId", verifyLogin, getSortCategory);
//=========================WISHLIST ROUTES =========================
router.get("/wishlist", verifyLogin, getWishlistPage);
router.post("/wishlist/add", verifyLogin, getAddToWishlist); 
router.post("/wishlist/remove", verifyLogin, getRemoveFromWishlist);
//=========================ADDRESS ROUTES =========================
router.get("/address", verifyLogin, getAddressPage);
router.post("/address", verifyLogin, postAddressSelection) 
router.get("/address/add", verifyLogin, getNewAddressPage);
router.post("/address/add", verifyLogin, postNewAddress);
//=========================ORDER ROUTES =========================
router.get("/orders", verifyLogin, getOrderPage);
router.get("/orders/cancel/:orderId/:productId", verifyLogin, getCancelProduct);
router.get("/orders/details/:orderId/:productId", verifyLogin, getOrderDetailsPage);
router.get("/payment", verifyLogin, getPaymentPage)
router.post("/checkout", verifyLogin, postCheckout);
router.post("/payment/verify", verifyLogin, verifyPayment)




router.post("/api/orders", async (req, res) => {
  try {
    let user = req.cookies.user ? req.cookies.user : null;
    let total = await getTotalAmount(user.userId);
    const order = await paypal.createOrder(total);
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
