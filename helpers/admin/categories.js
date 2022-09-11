const { Types } = require('mongoose');
const category_model = require('../../model/category_model')

module.exports = {
    AddCategory: (name, desc) => {
        return new Promise((resolve, reject) => {
            category_model.create({
                title: name,
                desc: desc,
            }).then((state) => {
                resolve(state)
            })
        })
    },
    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            category_model.deleteOne({_id: Types.ObjectId(id)}).then((state) => {
                resolve();
            })
        })
    },
    getCategoryById: (id) => {
        console.log(id)
        return new Promise((resolve, reject) => {
            category_model.findOne({_id: Types.ObjectId(id)}).then((category) => {
                resolve(category);
            })
        })
    },
    editCategory: (id, body) => {
        return new Promise((resolve, reject) => {
            category_model.updateOne({_id: Types.ObjectId(id)},{
               name: body.name,
               desc: body.desc, 
            }).then(() => {
                resolve();
            })
        })
    }
}