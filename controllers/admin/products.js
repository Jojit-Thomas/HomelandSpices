const fs = require("fs");
const path = require("path");
const { getCategoryById } = require("../../helpers/admin/categories");
const {
  AddProduct,
  deleteProduct,
  updateProduct,
  getProductCount,
} = require("../../helpers/admin/products");
const { getAllProducts, getProduct, getAllCategories } = require("../../helpers/common");
module.exports = {
  getProducts: async (req, res) => {
  let {limit = 10, page = 1, sort = -1, sortValue = 'date'} = req.query;
  let orderCount = await getProductCount()//get the total number of documents ordered
  let pageLimit = Math.ceil(orderCount / limit)//divide total number of order document / limit 
  page = (page < 1) ? 1 : (page > pageLimit) ? pageLimit : page; // if the page is less than 1 then make it 1 and if the page is greater than pageLimit then make it pageLimit
  const offset = (page - 1) * limit;//the start index of the document
  let products = await getAllProducts(offset, limit, sort, sortValue)//fetch document from the server
    res.render("admin/view_products", { admin: true, products: products, pageLimit : pageLimit, currentPage: page,limit : limit });
  },
  getAddProducts: (req, res) => {
    getAllCategories().then((categories) => {
      console.log(categories);
      res.render("admin/add_product", { admin: true, categories: categories });
    });
  },
    postAddProducts: async (req, res) => {
    let {max_price, category } = req.body; 
    pd_discount = parseInt(req.body.discount)// Product discount value
    req.body.pd_price = Math.round(max_price - ( pd_discount / 100) * max_price)//calculating the price && pd_price - product discount 
    let { discount } = await getCategoryById(category)// Fetching the discount value of category
    req.body.cd_price = Math.round(req.body.pd_price - (discount / 100) * req.body.pd_price)//this is the final price && pd_price - category discount
    // req.body.discount = discount + parseInt(pd_discount)//THis is the total discount && product discount + category discount
    // console.log(pd_discount , " == ", discount, " == ", req.body.discount )
    let img_ext = req.files.image1.name.split(".").pop(); // to get the extension of the file
    AddProduct(req.body, img_ext).then((result) => {
      for(let i = 1; i <= 4; i++) {
        var img_ext = req.files[`image${i}`].name.split(".").pop(); // to get the extension of the file
        const image = req.files[`image${i}`];
          image.mv(
            `./public/product_images/${result._id}-${i}.${img_ext}`, // adding image of product to the product images file
            (err, done) => {
              if (!err){
                 if(i === 4){
                  res.redirect("/admin/products")
                } 
              }
              else console.log(err);
            }
          );
      }
    });
  },
  deleteProduct: (req, res) => {
    // getProduct(req.params.id).then((result) => {
    //   console.log(result);
    //   fs.unlinkSync(
    //     path.join( 
    //       __dirname,
    //       `../../public/product_images/${req.params.id}.${result.img_ext}`
    //     )
    //   );
    // });
    //soft delete the product 
    deleteProduct(req.params.id).then((result) => {
      if (result) {
        res.status(200).json({success: true});
      } else {
        res.status().json("something went wrong");
      }
    });
  },
  getEditProduct: (req, res, next) => {
    getProduct(req.params.id).then(async (result) => {
        let categories = await getAllCategories()
        if(categories){
          categories.forEach((category, i) => {
            console.log("category is : ",category, result.category)
            if(category._id.toString() === result.category.toString()){
              delete categories[i]
            }
          })
        }
        res.render("admin/edit_product", { admin: true, product: result,categories: categories });
    }).catch((err) => {
      next(err);
    })
    
  },
  postEditProduct: async (req, res) => {
    //pd_price = Product Discounted Price
    //cd_price = Category Discounted Price
    if(req.files) { // check if the image is changed
      var img_ext = req.files?.image1.name.split(".").pop(); // getting the file extension of the old file
    }
    let {max_price, category } = req.body; 
    pd_discount = parseInt(req.body.discount)// Product discount value
    req.body.pd_price = Math.round(max_price - ( pd_discount / 100) * max_price)//calculating the price && pd_price - product discount 
    let { discount } = await getCategoryById(category)// Fetching the discount value of category
    req.body.cd_price = Math.round(req.body.pd_price - (discount / 100) * req.body.pd_price)//this is the final price && pd_price - category discount
    // req.body.discount = discount + parseInt(discount)//THis is the total discount && product discount + category discount
    updateProduct(req.params.id, req.body, img_ext).then((result) => {
      if (result) {
        // if image is changed add new image to the folder
        if (req.files) {
          for(let i = 1; i <= 4; i++) {//Moving each image to the folder
            var img_ext = req.files[`image${i}`].name.split(".").pop(); // to get the extension of the file
            const image = req.files[`image${i}`];
              image.mv(
                `./public/product_images/${req.params.id}-${i}.${img_ext}`, // adding image of product to the product images file
                (err, done) => {
                  if (!err){
                     if(i === 4){
                      res.redirect("/admin/products")
                    }
                  }
                  else console.log(err);
                }
              );
          }
        }
        //if image not changed redirect to products
        else {
          res.redirect("/admin/products");
        }
      } else {
        res.send("Unable to complete your request");
      }
    });
  },
};
