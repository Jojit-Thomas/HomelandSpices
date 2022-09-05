const { addAddress } = require("../../helpers/common");
const { getTotalAmount } = require("../../helpers/user/cart");
const {
  getCartProdutDetails,
  placeOrder,
  getOrders,
  // getOrderDetails,
  cancelOrders,
} = require("../../helpers/user/order");
module.exports = {
  getCheckoutPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    console.log(user);
    getTotalAmount(user.userId).then((total) => {
      res.render("user/checkout", { total: total, user: user });
    });
  },
  postCheckout: (req, res) => {
    console.log(req.body);
    let user = req.cookies.user ? req.cookies.user : null;
    addAddress(req.body).then((address) => {
      console.log(address);
      getCartProdutDetails(user.userId).then((products) => {
        getTotalAmount(user.userId).then((total) => {
          const data = {
            userId: user.userId,
            addressId: address._id,
            paymentMethod: req.body.paymentMethod,
          };
          placeOrder(data, products, total).then(() => {
            res.json({ status: true });
          });
        });
      });
    });
  },
  getOrderPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    getOrders(user.userId).then((orders) => {
      console.log(orders);
      res.render("user/orders", { orders: orders, user: user });
    });
  },
  // getOrderDetailsPage: (req, res) => {
  //   let user = req.cookies.user ? req.cookies.user : null;
  //   getOrderDetails(req.params.id).then((orders) => {
  //     res.render("user/order_details", { orderDetails: orders, user : user});
  //   });
  // },
  getCancelProduct: (req, res) => {
    cancelOrders(req.params.orderId, req.params.productId).then(() => {
      res.redirect("/");
    });
  },
};
