const { AddCategory, deleteCategory, getCategoryById, editCategory } = require("../../helpers/admin/categories");
const { getAllCategories } = require("../../helpers/common");

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
        res.redirect("/admin/category");
      } else {
        res.send("Some error occured");
      }
    });
  },
  getDeleteCategory: (req, res) => {
    deleteCategory(req.params.id).then(() => {
      res.redirect("/admin/category");
    })
  },
  getEditCategory: (req, res) => {
    getCategoryById(req.params.categoryId).then((category) => {
      console.log(category);
      res.render("admin/edit_category", { category: category });
    })
  },
  postEditCategory: (req, res) => {
    editCategory(req.params.categoryId, req.body).then(() => {
      res.redirect("/admin/category");
    })
  }
};
