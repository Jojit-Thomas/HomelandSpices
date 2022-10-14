const createHttpError = require("http-errors");
const { Types, default: mongoose } = require("mongoose");
const coupon_model = require("../../model/coupon_model");

module.exports = {
  addCoupon: (body) => {
    return new Promise((resolve, reject) => {
      const { title, desc, discount, coupon_code, min_amount } = body;
      coupon_model
        .create({
          title: title,
          desc: desc,
          coupon_code: coupon_code.toUpperCase(),
          min_amount: Number(min_amount),
          discount: Number(discount),
          total_coupon_used: 0,
        })
        .then((data) => resolve(data))
        .catch((err) => {
          // console.log(err);
          if (err.name === "MongoServerError" && err.code === 11000) {
            reject(createHttpError.Conflict("Coupon code must be unique"));
          } else {
            reject(createHttpError.InternalServerError());
          }
        });
    });
  },
  getAllCoupon: () => {
    return new Promise((resolve, reject) => {
      coupon_model
        .aggregate([
          {
            $sort: {date : -1}
          },
          {
            $set: {
              date: {
                $dateToString: {
                  format: "%d/%m/%Y -- %H:%M",
                  date: "$date",
                  timezone: "+05:30",
                },
              },
            },
          },
        ])
        .then((data) => resolve(data))
        .catch((err) => reject(createHttpError.InternalServerError()));
    });
  },
  deleteCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      coupon_model
        .deleteOne({ _id: Types.ObjectId(couponId) })
        .then(() => resolve())
        .catch(() => reject(createHttpError.InternalServerError()));
    });
  },
  getCouponDetails: (couponId) => {
    return new Promise((resolve, reject) => {
      coupon_model.findById(couponId).then((coupon) => {
        resolve(coupon);
      });
    });
  },
  updateCouponDetails: (couponId, body) => {
    return new Promise((resolve, reject) => {
      const { title, desc, coupon_code, discount, min_amount } = body;
      coupon_model
        .updateOne(
          { _id: Types.ObjectId(couponId) },
          {
            title: title,
            desc: desc,
            coupon_code: coupon_code.toUpperCase(),
            discount: Number(discount),
            min_amount: Number(min_amount),
          }
        )
        .then(() => resolve())
        .catch((err) => {
          // console.log(err);
          if (err.name === "MongoServerError" && err.code === 11000) {
            reject(createHttpError.Conflict("Coupon code must be unique"));
          } else {
            reject(createHttpError.InternalServerError());
          }
        });
    });
  },
};
