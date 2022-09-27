const { validateCoupon } = require("../helpers/common");

module.exports = {
    validateCoupon: (req, res, next) => {
        let {couponId} = req.params;
        console.log(couponId)
        couponId = couponId.toUpperCase().trim()
        validateCoupon(couponId).then((coupon) => {
          res.status(200).json(coupon)
        }).catch((err) => {
          res.status(401).json("Coupon is invalid")
        })
      }
}