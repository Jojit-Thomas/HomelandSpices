const {
  addAddress,
  getAddress,
  addCheckoutAddress,
  getAddressById,
} = require("../../helpers/user/address");
const { getTotalAmount } = require("../../helpers/user/cart");
const { generateRazorpay } = require("../../controllers/user/payment");
const {
  getCartProdutDetails,
  placeOrder,
  getOrders,
  // getOrderDetails,
  cancelOrders,
  getOrderDetails,
  reduceStock,
  getOrderProductPrice,
} = require("../../helpers/user/order");
const { addToWallet, validateCoupon } = require("../../helpers/common");
module.exports = {
  postCheckout: async (req, res, next) => {
    console.log(req.body);
   try{
    let user = req.cookies.user ? req.cookies.user : null;
    let addrs = req.cookies.address ? req.cookies.address : null;
    //getting the address and adding it into order address collection to make it immutable
    let address = await getAddressById(addrs);
    let orderAddress = await addCheckoutAddress(address);
    let { paymentMethod, coupon } = req.body
    coupon = await validateCoupon(coupon.toUpperCase())// this function returns coupon details if coupon not present it returns a error 401 && argument must be in uppercase letters
    coupon ? coupon : 0
    // fetching product details and total amount
    let products = await getCartProdutDetails(user.userId);
    products.forEach(async (product) => {//Reducing the stock from each products
      await reduceStock(product.productId, product.quantity)
    })
    let order = await getTotalAmount(user.userId);
    const data = {
      userId: user.userId,
      addressId: orderAddress._id,
      paymentMethod: paymentMethod,
      coupon: coupon.discount,
    };
    placeOrder(data, products, order).then((state) => {
      if (paymentMethod === "cashOnDelivery"){
        res.send({method: "cod"});
      } else if (paymentMethod === "razorPay"){
        console.log(state)
        generateRazorpay(state.id, state.total * 100).then((response) => {
          let state = {
            method: "razorPay",
            res: response,
          }
          console.log("ready to send response")
          res.send(state)
        })
      } else if (paymentMethod === "paypal"){
        res.send({method: "paypal"});
      }
    });
   } catch(err){
    if(err.status === 401) {
      res.status(401).json("Bad Request");
    } else {
      next(err);
    }
   }
  },
  getOrderPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    getOrders(user.userId).then((orders) => {
      console.log(orders);
      res.render("user/orders", {
        orders: orders,
        user: user,
      });
    });
  },
  getOrderDetailsPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    console.log(req.params)
    const { orderId, productId } = req.params;
    // totalOrderAmount(orderId)
    getOrderDetails(orderId, productId).then((orders) => {
      res.render("user/order_details", { orders: orders, user: user });
    });
  },
  getCancelProduct: async (req, res) => {
    const {orderId, productId} = req.params;
    let user = req.cookies.user ? req.cookies.user : null;
    let amount = await getOrderProductPrice(orderId, productId);
    await addToWallet(user.userId, amount)
    cancelOrders(orderId, productId).then(() => {
      res.redirect("/orders");
    });
    
  },
};
