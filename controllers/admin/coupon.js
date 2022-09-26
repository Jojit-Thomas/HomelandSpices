const {
  addCoupon,
  getAllCoupon,
  deleteCoupon,
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
  deleteCoupon: (req, res) => {
    deleteCoupon(req.params.couponId).then(() => res.status(204).json(true));
  },
};
