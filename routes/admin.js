const express = require("express");
const {
  getSignIn,
  postSignIn,
  adminAuth,
  stopAuthenticate,
} = require("../Controllers/Admin/Authentication");
const {
  getBannerPage, getAddBanner, postAddBanner
} = require("../controllers/admin/banner");
const {
  postAddCategory,
  getAddCategory,
  getCategoriesPage,
  getDeleteCategory,
  getEditCategory,
  postEditCategory
} = require("../controllers/admin/categories");
const {
  getHome,
  getLogout
} = require("../controllers/admin/main");
const {
  getOrderPage,
  getOrderDetailsPage,
  getChangeOrderStatus,
  getCancelOrder
} = require("../controllers/admin/orders");
const {
  getAddProducts,
  postAddProducts,
  getProducts,
  deleteProduct,
  getEditProduct,
  postEditProduct,
} = require("../controllers/admin/products");
const {
  getUsers,
  getdeleteUser,
  getEditUser,
  postEditUser,
  getAddUser,
  postAddUser,
  getBlockUser,
} = require("../controllers/admin/users");
const router = express.Router();


router.get("/", adminAuth, getHome); //Home_page
router.get("/signin", stopAuthenticate, getSignIn);
router.post("/signin", stopAuthenticate, postSignIn);
router.get("/logout", adminAuth, getLogout);

//===========================Product Management============================
router.get("/products", adminAuth, getProducts); //Products_page
router.get("/addProduct", adminAuth, getAddProducts); //Add_products_page
router.post("/addProduct", adminAuth, postAddProducts);
router.get("/deleteProduct/:id", adminAuth, deleteProduct);
router.get("/editproduct/:id", adminAuth, getEditProduct);
router.post("/editProduct/:id", adminAuth, postEditProduct);
//=============================User Management=============================
router.get("/users", adminAuth, getUsers);
router.get("/deleteUser/:id", adminAuth, getdeleteUser);
router.get("/editUser/:id", adminAuth, getEditUser);
router.post("/editUser/:id", adminAuth, postEditUser);
router.get("/addUser", adminAuth, getAddUser);
router.post("/addUser", adminAuth, postAddUser);
router.get("/blockUser/:id", adminAuth, getBlockUser);
//================================Categories================================
router.get("/category", adminAuth, getCategoriesPage);
router.get("/category/add", adminAuth, getAddCategory)
router.post("/category/add", adminAuth, postAddCategory)
router.get("/category/delete/:id", adminAuth, getDeleteCategory)
router.get("/category/edit/:categoryId", adminAuth, getEditCategory)
router.post("/category/edit/:categoryId", adminAuth, postEditCategory)
//=================================Orders=================================
router.get('/orders', adminAuth, getOrderPage)
router.get('/order/details/:id', getOrderDetailsPage)
router.post('/order/changeStatus', getChangeOrderStatus)
router.get('/order/cancel/:orderId/:productId', getCancelOrder)
//=================================Banners=================================
router.get('/banners', adminAuth, getBannerPage)
router.get('/banners/add', adminAuth, getAddBanner)
router.post('/banners/add', adminAuth, postAddBanner)




module.exports = router;