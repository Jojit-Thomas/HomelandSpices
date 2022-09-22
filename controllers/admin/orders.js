const { DataSessionList } = require("twilio/lib/rest/wireless/v1/sim/dataSession");
const {
  getOrders,
  updateOrderStatus,
  getOrderDetails,
  updatePaymentStatus,
} = require("../../helpers/admin/orders");

module.exports = {
  getOrderPage: (req, res) => {
    let {limit = 50, offset = 0, sort = 1, sortValue = 'date'} = req.query;
    getOrders(limit, offset, sort, sortValue).then((orders) => {
      res.render("admin/orders", { orders: orders, admin: true, limit: limit, offset: offset });
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
  getChangePaymentStatus: (req, res) => {
    const {orderId, status} = req.body;
    updatePaymentStatus(orderId, status).then(() => {
      res.status(200).send("success");
    })
  }
};
