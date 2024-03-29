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
const { getAllWishlist } = require("../../helpers/user/wishlist");

module.exports = {
  getAddToCart: (req, res) => {
    //take the user details from cookie
    let user = req.cookies.user ? req.cookies.user : null;
    addToCart(user.userId, req.body.productId).then(() => {
      res.status(200).json("success")
    });
  },
  getCartPage: async (req, res) => {
    console.log(req.params.userId)
    let user = req.cookies.user ? req.cookies.user : null;
    let data = await getCart(user.userId);
    console.log("data received: ",data)
    let wishlist = await getAllWishlist(user.userId);
    console.log(wishlist);
    if(wishlist[0]) {
      data.forEach(product => {
        wishlist[0].wishlistItems.forEach(wishlistItem => {
          if(product.cartItems.productId.toString() == wishlistItem.toString()) {
            product.wishlist = true;
            console.log(product)
          }
        });
      });
    }
    console.log(data);
    let amount = await getTotalAmount(user.userId)
    console.log(amount)
      res.render("user/cart", { data: data, order: amount, user: user });
  },  
  getCartChangeQuantity: (req, res) => {
    const { cart, product, user, count } = req.body;
    changeCartQuantity(cart, product, count).then((data) => {
      res.status(200).json("success");
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
     if(data) {
      for(x in data.cartItems) {
        let remains = (data.cart[x].stocks + 1) - data.cartItems[x].quantity// (1 + 1) - 1 = 1//this is to avoid the case where the stock is 1 and get the error out of stock
        console.log("remains : ",remains)
        if(remains <= 0){
          outOfStock = true;
          res.status(307).json({message: `Sorry, ${data.cart[x].title} product now out of stock, check again later`})
          break;
        }
      }
     }
      if(!outOfStock){
        res.status(200).json({success: true})
      }
    })
  },
  getCartTotalAmount: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null; 
    let total = await getTotalAmount(user.userId)
    res.status(200).json(total)
  }
};
  