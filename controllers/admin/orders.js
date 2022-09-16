const {
  getOrders,
  updateOrderStatus,
  getOrderDetails,
} = require("../../helpers/admin/orders");

module.exports = {
  getOrderPage: (req, res) => {
    getOrders().then((orders) => {
      res.render("admin/orders", { orders: orders, admin: true });
    });
  },
  getOrderDetailsPage: (req, res) => {
    getOrderDetails(req.params.id).then((orders) => {
      console.log("Order is : ", orders);
      res.render("admin/order_details", { orderDetails: orders, admin: true });
    });
  },
  getChangeOrderStatus: (req, res) => {
    const { orderId, productId, status } = req.body;
    updateOrderStatus(orderId, productId, status).then((orders) => {
      res.status(200).send("success");
    });
  },
  getCancelOrder: (req, res) => {
    const { orderId, productId } = req.params;
    updateOrderStatus(orderId, productId, "cancelled").then(() => {
      res.redirect(`/admin/order/details/${orderId}`);
    });
  },
};
