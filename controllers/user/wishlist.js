const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../../helpers/user/wishlist");

module.exports = {
  getWishlistPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    getWishlist(user.userId).then((wishListItems) => {
      res.render("user/wishlist", { wishListItems: wishListItems, user: user });
    });
  },
  getAddToWishlist: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    addToWishlist(user.userId, req.body.productId).then(() => {
      res.send("success");
    });
  },
  getRemoveFromWishlist: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    removeFromWishlist(user.userId, req.body.productId).then(() => {
      res.send("success");
    });
  },
};
