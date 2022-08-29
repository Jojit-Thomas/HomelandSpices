const { getAllProducts, getProduct } = require("../../helpers/common");

module.exports = {
  getHome: (req, res) => {
    console.log(req.user);
    getAllProducts().then((products) => {
      res.render("user/home", { title: "Homeland Spices", products: products});
    });
  },
  getProductPage: (req, res) => {
    getProduct(req.params.id).then((product) => {
      res.render("user/product_detail_view", { product: product })
    })
  }
}; 
 