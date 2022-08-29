const express = require("express");

const {
  getSignIn,
  getSignUp,
  userAuth,
  postSignIn,
  postSignUp,
  stopAuthenticate,
  getBlocked,
  getLogout,
  getOtpSigninPage,
  postGetOtp,
  postVerifyOtp,
} = require("../controllers/user/authentication");
const { getHome, getProductPage } = require("../controllers/user/main");
const router = express.Router();

// router.use((req, res, next) => {
//   res.setHeader("Cache-Control: no-cache, no-store, must-revalidate")
//   next();
// })
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* GET home page. */
router.get("/signin", stopAuthenticate, getSignIn);
router.post("/signin", stopAuthenticate, postSignIn);
router.get("/signup", stopAuthenticate, getSignUp);
router.post("/signup", stopAuthenticate, postSignUp); 
router.get("/blocked", stopAuthenticate, getBlocked);
router.get("/otpSigninPage", stopAuthenticate, getOtpSigninPage)
router.post("/getOtp", stopAuthenticate, postGetOtp);
router.post("/verifyOtp", stopAuthenticate, postVerifyOtp);
// router.use(cookieJwtAuth, (req, res, next) => { // authenticate sessions
//   next();
// });

router.get("/",userAuth, getHome);
router.get("/product/:id", getProductPage)
router.get("/logout", userAuth, getLogout)
module.exports = router;
