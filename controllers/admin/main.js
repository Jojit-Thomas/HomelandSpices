const { getStats, userStatsCount, orderStatsCount, orderPendingDeliveryStatsCount, orderPendingdispatchStatsCount, getStatsWeekly } = require("../../helpers/admin/orders");
module.exports = {
  getHome: async (req, res) => {
    // res.send('asdf')
    res.render("admin/home", { title: "Homeland Spices", admin: true });
  },
  getLogout: (req, res) => {
    res.clearCookie("adminToken");
    res.redirect("/admin");
  },
  getSalesStatsDate: (req, res) => {
    getStats(req.query.timestamp).then((stats) => {
      console.log("accessed")
      res.status(200).json(stats);
    })
  },
  getSalesStatsWeekly: (req, res) => {
    getStatsWeekly(req.query.timestamp).then((stats) => {
      console.log("accessed")
      res.status(200).json(stats);
    })
  },
  getStatsCount: async (req, res) => {
    if (req.query.val === "user" ) {
      var count = await userStatsCount()
    } else if (req.query.val === "order") {
      var count = await orderStatsCount()
    } else if (req.query.val === "order_pending_dispatch") {
      var count = await orderPendingdispatchStatsCount()
    } else if (req.query.val === "order_pending_delivery") {
      var count = await orderPendingDeliveryStatsCount()
    }
    res.status(200).json(count);
  }
};
