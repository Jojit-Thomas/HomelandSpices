const { Types } = require("mongoose");
const { PRODUCT_COLLECTION } = require("../../config/collections");
const wishlist_model = require("../../model/wishlist_model");

module.exports = {
  addToWishlist: (userId, productId) => {
    return new Promise((resolve, reject) => {
      wishlist_model
        .findOne({ userId: Types.ObjectId(userId) })
        .then((wishlist) => {
          if (wishlist) {
            wishlist_model
              .updateOne(
                {
                  userId: Types.ObjectId(userId),
                },
                {
                  $push: { wishlistItems: Types.ObjectId(productId) },
                }
              )
              .then(() => {
                resolve();
              });
          } else {
            wishlist_model
              .create({
                userId: Types.ObjectId(userId),
                wishlistItems: [Types.ObjectId(productId)],
              })
              .then(() => {
                resolve();
              });
          }
        });
    });
  },
  getWishlist: (userId) => {
    return new Promise((resolve, reject) => {
      wishlist_model
        .aggregate([
          { $match: { userId: Types.ObjectId(userId) } },
          { $unwind: "$wishlistItems" },
          {
            $lookup: {
              from: PRODUCT_COLLECTION,
              localField: "wishlistItems",
              foreignField: "_id",
              as: "wishlist",
            },
          },
          { $unwind: "$wishlist" },
        ])
        .then((result) => {
          console.log(result);
          resolve(result);
        });
    });
  },
  removeFromWishlist: (userId, productId) => {
    return new Promise((resolve, reject) => {
      wishlist_model.updateOne(
        {
          userId: Types.ObjectId(userId),
        },
        {
          $pull: { wishlistItems: Types.ObjectId(productId) },
        }
      ).then((state) => {
        resolve();
      })
    });
  },
};
