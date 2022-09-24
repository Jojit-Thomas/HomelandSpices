const createHttpError = require("http-errors");
const { Types, default: mongoose } = require("mongoose");
const category_model = require("../../model/category_model");

module.exports = {
  AddCategory: (name, desc, img_ext, discount) => {
    return new Promise((resolve, reject) => {
      category_model
        .create({
          title: name,
          desc: desc,
          img_ext: img_ext,
          discount : discount,
          date: new Date(),
        })
        .then((category) => {
          console.log(category);
          category ? resolve(category) : reject(createHttpError.InternalServerError());
        });
    });
  },
  isCategoryExist: (title, id = '507f191e810c19729de860ea') => {
    return new Promise((resolve, reject) => {
      var regex = new RegExp(["^", title, "$"].join(""), "i");//Creates a regex to match both uppercase and lowercase letters
      if (!mongoose.Types.ObjectId.isValid(id)) {
        reject(createHttpError.BadRequest()); //If the provided userId is not a valid ObjectId
      }
      category_model
        .findOne({
          _id: { $ne: Types.ObjectId(id) },// 
          title: regex,
        })
        .then((category) => {
          !category ? resolve() : reject(createHttpError.Conflict());//If the category name provided already exists then it will reject and create a new error
        });
    });
  },
  deleteCategory: (id) => {
    return new Promise((resolve, reject) => {
      category_model.deleteOne({ _id: Types.ObjectId(id) }).then((state) => {
        resolve();
      });
    });
  },
  getCategoryById: (id) => {
    console.log(id);
    return new Promise((resolve, reject) => {
      category_model.findOne({ _id: Types.ObjectId(id) }).then((category) => {
        resolve(category);
      });
    });
  },
  editCategory: (id, ...body) => {
    return new Promise((resolve, reject) => {
      const [name, desc, img_ext, discount] = body;
      console.log(name, desc, img_ext);
      category_model
        .updateOne(
          { _id: Types.ObjectId(id) },
          {
            title: name,
            desc: desc,
            discount: discount,
            img_ext: img_ext
          }
        )
        .then((category) => {
          console.log("cat",category);
          resolve(category);
        });
    });
  },
};
