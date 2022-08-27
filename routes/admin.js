const express = require("express");
const {
  getSignIn,
  postSignIn,
  adminAuth,
  stopAuthenticate,
} = require("../Controllers/Admin/Authentication");
const { getHome } = require("../controllers/admin/main");
const {
  getAddProducts,
  postAddProducts,
  getProducts,
  deleteProduct,
  getEditProduct,
  postEditProduct,
} = require("../controllers/admin/products");
const { getUsers, getdeleteUser, getEditUser, postEditUser } = require("../controllers/admin/users");
const router = express.Router();

/* GET home page. */
router.get("/signin", stopAuthenticate, getSignIn);
router.post("/signin", stopAuthenticate, postSignIn);

// router.use(adminAuth, (req, res, next) => {//Must_login_to_use_this_routes
//     next();
// })

router.get("/", adminAuth, getHome); //Home_page
router.get("/products", adminAuth, getProducts); //Products_page
router.get("/addProduct", adminAuth, getAddProducts); //Add_products_page
router.post("/addProduct", adminAuth, postAddProducts);
router.get("/deleteProduct/:id", adminAuth, deleteProduct);
router.get("/editproduct/:id", adminAuth, getEditProduct);
router.post("/editProduct/:id", adminAuth, postEditProduct);
router.get("/users", adminAuth, getUsers)
router.get("/deleteUser/:id", adminAuth, getdeleteUser)
router.get("/editUser/:id", adminAuth, getEditUser)
router.post("/editUser/:id", adminAuth, postEditUser)
router.get("/addUser", adminAuth, )
module.exports = router;
 