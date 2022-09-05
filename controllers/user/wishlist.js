const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../../helpers/user/wishlist");

module.exports = {
  getWishlistPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    getWishlist(user.userId).then((products) => {
      res.render("user/wishlist", { products: products });
    });
  },
  getAddToWishlist: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    addToWishlist(user.userId, req.params.productId).then(() => {
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
