const { getStats } = require("../../helpers/admin/orders");
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
  }
};
