const express = require("express");

const {
  getSignIn,
  getSignUp,
  userAuth,
  postSignIn,
  postSignUp,
  stopAuthenticate,
} = require("../controllers/user/authentication");
const { getHome } = require("../controllers/user/main");
const router = express.Router();

/* GET home page. */
router.get("/signin", stopAuthenticate, getSignIn);
router.get("/signup", stopAuthenticate, getSignUp);
router.post("/signin", stopAuthenticate, postSignIn);
router.post("/signup", stopAuthenticate, postSignUp);


// router.use(cookieJwtAuth, (req, res, next) => { // authenticate sessions
//   next();
// });

router.get("/",userAuth, getHome);

module.exports = router;
