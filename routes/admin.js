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
router.get("/logout", adminAuth, getLogout);
router.get("/stats/sales", adminAuth, getSalesStatsDate);
router.get("/stats/sales/weekly", adminAuth, getSalesStatsWeekly);
router.get("/stats/count", adminAuth, getStatsCount);
router.route("/signin").get(stopAuthenticate, getSignIn).post(stopAuthenticate, postSignIn);

//===========================Product Management============================
router.get("/products", adminAuth, getProducts); //Products_page
router.delete("/product/delete/:id", adminAuth, deleteProduct);
router.route("/product/add").get(adminAuth, getAddProducts).post(adminAuth, postAddProducts)
router.route("/product/edit/:id").get(adminAuth, getEditProduct).post(adminAuth, postEditProduct);
//=============================User Management=============================
router.get("/users", adminAuth, getUsers);
router.get("/deleteUser/:userId", adminAuth, getdeleteUser);
router.get("/user/block/:userId", adminAuth, getBlockUser);
router.route("/user/add").get(adminAuth, getAddUser).post(adminAuth, postAddUser);
router.route("/user/edit/:userId").get(adminAuth, getEditUser).post(adminAuth, postEditUser);
//================================Categories================================
router.get("/category", adminAuth, getCategoriesPage);
router.get("/category/delete/:categoryId", adminAuth, getDeleteCategory);
router.route("/category/add").get(adminAuth, getAddCategory).post(adminAuth, postAddCategory);
router.route("/category/edit/:categoryId").get(adminAuth, getEditCategory).post(adminAuth, postEditCategory);
//=================================Orders=================================
router.get("/orders", adminAuth, getOrderPage);
router.get("/order/details/:id", adminAuth, getOrderDetailsPage);
router.post("/order/changeStatus", adminAuth, getChangeOrderStatus);
router.post("/order/paymentStatus/change", adminAuth, getChangePaymentStatus)
router.get("/order/cancel/:orderId/:productId", adminAuth, getCancelOrder);
//=================================Banners=================================
router.get("/banners", adminAuth, getBannerPage);
router.post("/banners/edit", adminAuth, postEditPosition);
router.get("/banners/delete/:bannerId", adminAuth, getdeleteBanner);
router.route("/banners/add").get(adminAuth, getAddBanner).post(adminAuth, postAddBanner);
//=================================Coupons=================================
router.get("/coupon", adminAuth, getCouponPage)
router.delete("/coupon/delete/:couponId", adminAuth, deleteCoupon)
router.route("/coupon/add").get(adminAuth, getAddCouponPage).post(adminAuth, addCoupon);
router.route("/coupon/edit/:couponId").get(adminAuth, getEditCoupon).post(adminAuth, editCoupon);
router.get("/report", adminAuth, getReportPage)

module.exports = router;