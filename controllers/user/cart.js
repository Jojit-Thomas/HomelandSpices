const { addAddress } = require("../../helpers/common");
const {
  addToCart,
  getCart,
  getTotalAmount,
  changeCartQuantity,
  removeFromCart,
} = require("../../helpers/user/cart");

module.exports = {
  getAddToCart: (req, res) => {
    console.log("add to cart");
    console.log(req.params.userId);
    console.log(req.params.proId);
    addToCart(req.params.userId, req.params.proId).then(() => {
      console.log("added to cart");
      res.redirect(`/cart/${req.params.userId}`);
    });
  },
  getCartPage: (req, res) => {
    console.log(req.params.userId)
    getCart(req.params.userId).then((data) => {
      let user = req.cookies.user ? req.cookies.user : null;
      getTotalAmount(req.params.userId).then((total) => {
        res.render("user/cart", { data: data, total: total, user: user });
      });
    });
  },  
  getCartChangeQuantity: (req, res) => {
    const { cart, product, user, count } = req.body;
    changeCartQuantity(cart, product, count).then((data) => {
      getTotalAmount(user).then((total) => {
        data.total = total;
        console.log(data);
        res.status(200).json(data);
      });
    });
  },
  getRemoveFromCart: (req, res) => {
    const { cart, product } = req.body;
    let user = req.cookies.user ? req.cookies.user : null;
    removeFromCart(cart, product).then((data) => {
      if (data) {
        res.redirect(`/cart/${user.userId}`);
      } else {
        res.send("some error occured");
      }
    });
  },
};
