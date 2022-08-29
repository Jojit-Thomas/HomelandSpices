module.exports = {
    getHome: (req, res) => {
        // res.send('asdf')
        res.render("admin/home", { title: "Homeland Spices", admin: true });
      },
      getLogout: (req, res) => {
        res.clearCookie("adminToken")
        res.redirect("/admin")
      }
  };
  