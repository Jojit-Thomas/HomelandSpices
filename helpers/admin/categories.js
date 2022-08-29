const category_model = require('../../model/category_model')

module.exports = {
    getAllCategories: () => {
        return new Promise((resolve, reject) => {
            category_model.find().then((category) => {
                resolve(category);
            })
        })
    },
    AddCategory: (name, desc) => {
        return new Promise((resolve, reject) => {
            category_model.create({
                title: name,
                desc: desc,
            }).then((state) => {
                resolve(state)
            })
        })
    }
}