
module.exports = {
    getHome: (req, res) => {
        console.log(req.user)
        res.render("user/home", { title: "Homeland Spices" });
      },
  };
  