const { DataSessionList } = require("twilio/lib/rest/wireless/v1/sim/dataSession");
const {
  getOrders,
  updateOrderStatus,
  getOrderDetails,
  updatePaymentStatus,
  getOrderCount,
} = require("../../helpers/admin/orders");

module.exports = {
  getOrderPage: async (req, res) => {
    let {limit = 10, page = 1, sort = -1, sortValue = 'date'} = req.query;
    let orderCount = await getOrderCount()//get the total number of documents ordered
    orderCount = (orderCount < 1) ? 1 : orderCount;
    let pageLimit = Math.ceil(orderCount / limit)//divide total number of order document / limit 
    page = (page < 1) ? 1 : (page > pageLimit) ? pageLimit : page; // if the page is less than 1 then make it 1 and if the page is greater than pageLimit then make it pageLimit
    offset = (page - 1) * limit;//the start index of the document
    let orders = await getOrders(offset, limit, sort, sortValue)//fetch document from the server
    res.render("admin/orders", { orders: orders, admin: true, pageLimit : pageLimit, currentPage: page, limit: limit});
  },
  getOrderDetailsPage: async (req, res, next) => {
    try{
      let orders = await getOrderDetails(req.params.id)
      res.render("admin/order_details", { orderDetails: orders, admin: true });
    } catch(err) {
      next(err);
    }
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
