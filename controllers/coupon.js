const { validateCoupon } = require("../helpers/common");
const { getTotalAmount } = require("../helpers/user/cart");

module.exports = {
    validateCoupon: (req, res, next) => {
        let {couponId} = req.params;
        let user = req.cookies.user ? req.cookies.user : null;
        couponId = couponId.toUpperCase().trim()
        validateCoupon(couponId).then(async (coupon) => {
          let total_amount = await getTotalAmount(user.userId)
          if(total_amount.total_amount > coupon.min_amount){
            res.status(200).json(coupon)
          } else {
            res.status(401).json(`Minimum amount to apply coupon is ${coupon.min_amount}`)
          }
        }).catch((err) => {
          res.status(401).json("Coupon code is invalid")
        })
      }
}