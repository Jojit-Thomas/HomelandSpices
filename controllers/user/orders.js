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
const { addToWallet, validateCoupon, incCoupon, addWalletTransaction, getProduct, getWalletBalance } = require("../../helpers/common");
const createHttpError = require("http-errors");
const { changePaymentStatus } = require("../../helpers/user/payment");
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
    coupon = coupon.trim().toUpperCase()//trims the white spaces and transform text into uppercase
    let order = await getTotalAmount(user.userId);
    let coupon_details;
    if(coupon) {
      coupon_details = await validateCoupon(coupon)// this function returns coupon details if coupon not present it returns a error 401 && argument must be in uppercase letters
      if(order.total_amount <= coupon_details.min_amount) {// This condition checks the min_amount of the coupon is satisfied
        createHttpError.Unauthorized(`Minimum amount to apply coupon is ${coupon.min_amount}`);
      }
      await incCoupon(coupon)// This function increment the field total_coupon_used
      console.log(coupon)
    }
    // fetching product details and total amount
    let products = await getCartProdutDetails(user.userId);
    products.forEach(async (product) => {//Reducing the stock from each products
      await reduceStock(product.productId, product.quantity)
    })
    const data = {
      userId: user.userId,
      addressId: orderAddress._id,
      paymentMethod: paymentMethod,
      coupon: coupon_details ? coupon_details.discount : 0,
      coupon_code: coupon_details ? coupon_details.coupon_code : null,
    };
    placeOrder(data, products, order).then( async (state) => {
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
      } else if (paymentMethod === "wallet") {
        console.log("userID is : ", user.userId)
        let user_wallet = await getWalletBalance(user.userId)
        console.log("user_wallet :",user_wallet, "order: ", order)
        console.log("bool :",user_wallet.wallet < order.total_amount)
        if(user_wallet.wallet < order.total_amount) {
          res.status(401).json({
            error : "insufficient_wallet",
            message : "Insufficient balance in wallet"
          })
        } else {
          wallet_amount = -1 * order.total_amount
          await addToWallet(user.userId, wallet_amount)
          await addWalletTransaction(user.userId, "Purchase deduction", wallet_amount)
          await changePaymentStatus(state.id)
          res.status(200).json({method: "wallet"})
        }
      }
    });
   } catch(err){
    console.log(err)
    if(err.status === 401) {
      res.status(err.status).json(err.message);
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
    let product = await getProduct(productId);
    await addToWallet(user.userId, amount);
    await addWalletTransaction(user.userId, `Refund for ${product.title}`, amount)
    console.log("amount add to walllet")
    cancelOrders(orderId, productId).then(() => {
      res.redirect("/orders");
    });
  },
};
