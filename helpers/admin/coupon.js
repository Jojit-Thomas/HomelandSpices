const createHttpError = require("http-errors");
const { Types, default: mongoose } = require("mongoose");
const coupon_model = require("../../model/coupon_model");

module.exports = {
  addCoupon: (body) => {
    return new Promise((resolve, reject) => {
      const { title, desc, discount, coupon_code } = body;
      coupon_model
        .create({
          title: title,
          desc: desc,
          coupon_code: coupon_code.toUpperCase(),
          discount: Number(discount),
        })
        .then((data) => resolve(data))
        .catch((err) => {
          // console.log(err);
          if (err.name === 'MongoServerError' && err.code === 11000) {
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
};
