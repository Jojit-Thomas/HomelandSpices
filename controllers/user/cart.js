const { addAddress } = require("../../helpers/common");
const {
  addToCart,
  getCart,
  getTotalAmount,
  changeCartQuantity,
  removeFromCart,
  checkStock,
  cartProducts,
} = require("../../helpers/user/cart");

module.exports = {
  getAddToCart: (req, res) => {
    //take the user details from cookie
    let user = req.cookies.user ? req.cookies.user : null;
    addToCart(user.userId, req.body.productId).then(() => {
      res.status(200).json("success")
    });
  },
  getCartPage: (req, res) => {
    console.log(req.params.userId)
    let user = req.cookies.user ? req.cookies.user : null;
    getCart(user.userId).then((data) => {
      let user = req.cookies.user ? req.cookies.user : null;
      getTotalAmount(user.userId).then((amount) => {
        console.log(amount)
        res.render("user/cart", { data: data, order: amount, user: user });
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
        res.send("Some error occured");
      }
    });
  },
  getCheckStock: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    cartProducts(user.userId).then((data) => {
      let outOfStock ;
      for(x in data.cartItems) {
        let remains = (data.cart[x].stocks + 1) - data.cartItems[x].quantity// (1 + 1) - 1 = 1//this is to avoid the case where the stock is 1 and get the error out of stock
        console.log("remains : ",remains)
        if(remains <= 0){
          outOfStock = true;
          res.status(307).json({message: `Sorry, ${data.cart[x].title} product now out of stock, check again later`})
          break;
        }
      }
      if(!outOfStock){
        res.status(200).json({success: true})
      }
    })
  }
};
  