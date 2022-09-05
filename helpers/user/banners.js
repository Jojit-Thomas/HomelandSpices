const banner_model = require("../../model/banner_model");

module.exports = {
    getBannerImage: () => {
        return new Promise((resolve, reject) => {
            banner_model.findOne().sort({position: 1}).then((banner) => {
                resolve(banner);
            })
        })
    }
}