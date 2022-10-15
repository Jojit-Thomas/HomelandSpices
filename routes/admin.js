const express = require("express");
const {
  getSignIn,
  postSignIn,
  adminAuth,
  stopAuthenticate,
} = require("../controllers/admin/authentication");
const {
  getBannerPage,
  getAddBanner,
  postAddBanner,
  postEditPosition,
  getdeleteBanner,
} = require("../controllers/admin/banner");
const {
  postAddCategory,
  getAddCategory,
  getCategoriesPage,
  getDeleteCategory,
  getEditCategory,
  postEditCategory,
} = require("../controllers/admin/categories");
const { getCouponPage, getAddCouponPage, addCoupon, deleteCoupon, getEditCoupon, editCoupon } = require("../controllers/admin/coupon");
const { getHome, getLogout, getSalesStatsDate, getStatsCount, getSalesStatsWeekly, getReportPage } = require("../controllers/admin/main");
const {
  getOrderPage,
  getOrderDetailsPage,
  getChangeOrderStatus,
  getCancelOrder,
  getChangePaymentStatus,
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
router.get("/stats/sales", adminAuth, getSalesStatsDate);
router.get("/stats/sales/weekly", adminAuth, getSalesStatsWeekly);
router.get("/stats/count", adminAuth, getStatsCount);

//===========================Product Management============================
router.get("/products", adminAuth, getProducts); //Products_page
router.get("/product/add", adminAuth, getAddProducts); //Add_products_page
router.post("/product/add", adminAuth, postAddProducts);
router.delete("/product/delete/:id", adminAuth, deleteProduct);
router.get("/product/edit/:id", adminAuth, getEditProduct);
router.post("/product/edit/:id", adminAuth, postEditProduct);
//=============================User Management=============================
router.get("/users", adminAuth, getUsers);
router.get("/deleteUser/:userId", adminAuth, getdeleteUser);
router.get("/user/edit/:userId", adminAuth, getEditUser);
router.post("/user/edit/:userId", adminAuth, postEditUser);
router.get("/user/add", adminAuth, getAddUser);
router.post("/user/add", adminAuth, postAddUser);
router.get("/user/block/:userId", adminAuth, getBlockUser);
//================================Categories================================
router.get("/category", adminAuth, getCategoriesPage);
router.get("/category/add", adminAuth, getAddCategory);
router.post("/category/add", adminAuth, postAddCategory);
router.get("/category/delete/:categoryId", adminAuth, getDeleteCategory);
router.get("/category/edit/:categoryId", adminAuth, getEditCategory); 
router.post("/category/edit/:categoryId", adminAuth, postEditCategory);
//=================================Orders=================================
router.get("/orders", adminAuth, getOrderPage);
router.get("/order/details/:id", adminAuth, getOrderDetailsPage);
router.post("/order/changeStatus", adminAuth, getChangeOrderStatus);
router.post("/order/paymentStatus/change", adminAuth, getChangePaymentStatus)
router.get("/order/cancel/:orderId/:productId", adminAuth, getCancelOrder);
//=================================Banners=================================
router.get("/banners", adminAuth, getBannerPage);
router.get("/banners/add", adminAuth, getAddBanner);
router.post("/banners/add", adminAuth, postAddBanner);
router.post("/banners/edit", adminAuth, postEditPosition);
router.get("/banners/delete/:bannerId", adminAuth, getdeleteBanner);
//=================================Coupons=================================
router.get("/coupon", adminAuth, getCouponPage)
router.get("/coupon/add", adminAuth, getAddCouponPage)
router.post("/coupon/add", adminAuth, addCoupon)
router.get("/coupon/edit/:couponId", adminAuth, getEditCoupon)
router.post("/coupon/edit/:couponId", adminAuth, editCoupon)
router.delete("/coupon/delete/:couponId", adminAuth, deleteCoupon)

router.get("/report", adminAuth, getReportPage)

module.exports = router;
