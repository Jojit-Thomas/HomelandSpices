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
    //take the user details from cookie
    let user = req.cookies.user ? req.cookies.user : null;
    addToCart(user.userId, req.body.productId).then(() => {
      res.status(200)
    });
  },
  getCartPage: (req, res) => {
    console.log(req.params.userId)
    let user = req.cookies.user ? req.cookies.user : null;
    getCart(user.userId).then((data) => {
      let user = req.cookies.user ? req.cookies.user : null;
      getTotalAmount(user.userId).then((total) => {
        console.log(total)
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
        res.redirect("/cart");
      } else {
        res.send("some error occured");
      }
    });
  },
};
