const {
  addCoupon,
  getAllCoupon,
  deleteCoupon,
  getCouponDetails,
  updateCouponDetails,
} = require("../../helpers/admin/coupon");

module.exports = {
  getCouponPage: async (req, res) => {
    let coupon = await getAllCoupon();
    res.render("admin/view_coupon", { admin: true, coupon: coupon });
  },
  getAddCouponPage: (req, res) => {
    res.render("admin/add_coupon", { admin: true });
  },
  addCoupon: (req, res, next) => {
    addCoupon(req.body)
      .then(() => res.status(200).json(true))
      .catch((err) => {
        console.log("conflict error");
        res.status(err.status).json(err.message);
      });
  },
  getEditCoupon: async (req, res) => {
    let coupon = await getCouponDetails(req.params.couponId);
    console.log(coupon);
    res.render("admin/edit_coupon", { admin: true, coupon: coupon });
  },
  deleteCoupon: (req, res) => {
    deleteCoupon(req.params.couponId).then(() => res.status(204).json(true));
  },
  editCoupon: async (req, res) => {
    try {
      await updateCouponDetails(req.params.couponId, req.body);
      res.status(200).json(true)
    } catch (err) {
      res.status(err.status).json(err.message);
    }
  },
};
