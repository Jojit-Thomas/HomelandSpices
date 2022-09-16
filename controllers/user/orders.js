const {
  addAddress,
  getAddress,
  addCheckoutAddress,
  getAddressById,
} = require("../../helpers/user/address");
const { getTotalAmount } = require("../../helpers/user/cart");
const {
  getCartProdutDetails,
  placeOrder,
  getOrders,
  // getOrderDetails,
  cancelOrders,
  getOrderDetails,
  addOrderProducts,
  totalOrderAmount,
} = require("../../helpers/user/order");
module.exports = {
  postCheckout: async (req, res) => {
    console.log(req.body);
    let user = req.cookies.user ? req.cookies.user : null;
    let addrs = req.cookies.address ? req.cookies.address : null;
    //getting the address and adding it into order address collection to make it immutable
    let address = await getAddressById(addrs);
    let orderAddress = await addCheckoutAddress(address);
    let paymentMethod =
      req.body.paymentMethod === ("Cash On Delivery" || "Online Payment")
        ? req.body.paymentMethod
        : "Manipulated Payment Status";
    // fetching product details and total amount
    let products = await getCartProdutDetails(user.userId);
    console.log("products is " , products)
    // let orderProducts = await addOrderProducts(user.userId, products[0])
    // console.log("orderProducts is : ", orderProducts);
    let total = await getTotalAmount(user.userId);
    const data = {
      userId: user.userId,
      addressId: orderAddress._id,
      paymentMethod: paymentMethod,
    };
    placeOrder(data, products, total).then(() => {
      res.redirect("/");
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
