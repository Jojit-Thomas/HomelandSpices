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
    let orderProducts = await addOrderProducts(user.userId, products[0])
    console.log("orderProducts is : ", orderProducts);
    // console.log("total is : ", data);
    //         data.map((item) => {
    //           item.cartItems.total = item.total;
    //           item.cartItems.status = "Order Placed";
    //         });
    //         let products = [];
    //         data.forEach((item) => {
    //           products.push(item.cartItems);
    //         });
    //         console.log("modified data is : ", data);
    // let orderProducts = await 
    let total = await getTotalAmount(user.userId);
    const data = {
      userId: user.userId,
      addressId: orderAddress._id,
      paymentMethod: paymentMethod,
    };
    placeOrder(data, orderProducts, total).then(() => {
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
    const { orderId, productId } = req.params;
    getOrderDetails(orderId, productId).then((orders) => {
      console.log(orders[0]);
      res.render("user/order_details", { order: orders[0], user: user });
    });
  },
  getCancelProduct: (req, res) => {
    cancelOrders(req.params.orderId, req.params.productId).then(() => {
      res.redirect("/");
    });
  },
};
