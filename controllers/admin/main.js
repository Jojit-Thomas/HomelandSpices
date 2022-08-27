module.exports = {
    getHome: (req, res) => {
        // res.send('asdf')
        res.render("admin/home", { title: "Homeland Spices", admin: true });
      },
  };
  