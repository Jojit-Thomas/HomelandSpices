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
  addOrderProducts,
  totalOrderAmount,
  reduceStock,
} = require("../../helpers/user/order");
module.exports = {
  postCheckout: async (req, res) => {
    console.log(req.body);
    let user = req.cookies.user ? req.cookies.user : null;
    let addrs = req.cookies.address ? req.cookies.address : null;
    //getting the address and adding it into order address collection to make it immutable
    let address = await getAddressById(addrs);
    let orderAddress = await addCheckoutAddress(address);
    const { paymentMethod } = req.body
    // fetching product details and total amount
    let products = await getCartProdutDetails(user.userId);
    products.forEach(async (product) => {
      await reduceStock(product.productId, product.quantity)
    })
    console.log("products is " , products)
    // let orderProducts = await addOrderProducts(user.userId, products[0])
    // console.log("orderProducts is : ", orderProducts);
    let total = await getTotalAmount(user.userId);
    const data = {
      userId: user.userId,
      addressId: orderAddress._id,
      paymentMethod: paymentMethod,
    };
    placeOrder(data, products, total).then((state) => {
      if (paymentMethod === "cashOnDelivery"){
        res.send({method: "cod"});
      } else if (paymentMethod === "razorPay"){
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
  getCancelProduct: (req, res) => {
    const {orderId, productId} = req.params;
    cancelOrders(orderId, productId).then(() => {
      res.redirect("/orders");
    });
    
  },
};
