const { AddCategory, getAllCategories } = require("../../helpers/admin/categories");

module.exports = {
  getCategoriesPage: (req, res) => {
    getAllCategories().then((categories) => {
        res.render("admin/view_categories", {admin: true, categories: categories})
    })
  },
  getAddCategory: (req, res) => {
    res.render("admin/add_categories", { admin: true });
  },
  postAddCategory: (req, res) => {
    const { name, desc } = req.body;
    AddCategory(name, desc).then((state) => {
      if (state) {
        res.redirect("/admin/categories");
      } else {
        res.send("Some error occured");
      }
    });
  },
};
