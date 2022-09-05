const { getOrders, updateOrderStatus, getOrderDetails } = require("../../helpers/admin/orders");

module.exports = {
  getOrderPage: (req, res) => {
    getOrders().then((orders) => {
      res.render("admin/orders", { orders: orders, admin: true });
    });
  },
  getOrderDetailsPage: (req, res) => {
    getOrderDetails(req.params.id).then((orders) => {
      res.render('admin/order_details',{orderDetails:orders, admin: true})
    })
  },
  getChangeOrderStatus : (req, res) => {
    const { orderId, productId, status } = req.body
    updateOrderStatus(orderId, productId, status).then((orders) => {
      res.status(200).send("success")
    })
  },
  getCancelOrder: (req, res) => {
    console.log(req.params.orderId)
    console.log('success')
    updateOrderStatus(req.params.orderId,req.params.productId, "cancelled").then(() => {
      res.redirect('/admin/orders')
    })
  }
};
