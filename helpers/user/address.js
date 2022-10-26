const { Types } = require("mongoose");
const address_model = require("../../model/address_model");
const order_address_model = require("../../model/order_address_model");

module.exports = {
  getAddress: (userId) => {
    return new Promise((resolve, reject) => {
      address_model.find({ userId: Types.ObjectId(userId) }).then((address) => {
        resolve(address);
      });
    });
  },
  getAddressById: (addressId) => {
    return new Promise((resolve, reject) => {
      address_model
        .findOne({ _id: Types.ObjectId(addressId) })
        .then((address) => {
          resolve(address);
        });
    });
  },
  addAddress: (body, userId) => {
    return new Promise((resolve, reject) => {
      body.pincode = Number(body.pincode)
      body.userId = Types.ObjectId(userId);
      address_model.create(body).then((state) => {
        resolve(state);
      });
    });
  },
  addCheckoutAddress: (address) => {
    address.pincode = Number(address.pincode)
    console.log("address is : ", address);
    return new Promise((resolve, reject) => {
      order_address_model.create(address).then((state) => {
        resolve(state);
      });
    });
  },
  deleteAddress: (id) => {
    return new Promise((resolve, reject) => {
      address_model.deleteOne({_id: Types.ObjectId(id)}).then(() => {
        resolve();
      })
    })
  },
  getAddressCount: (userId) => {
    return new Promise((resolve, reject) => {
      address_model.find({userId: Types.ObjectId(userId)}).count().then((count)=> {
        resolve(count)
      })
    })
  },
  updateAddress: (addressId, addressDetails) => {
    return new Promise ((resolve, reject) => {
      address_model.updateOne({_id: Types.ObjectId(addressId)}, {$set: addressDetails}).then((data) => {
        console.log(data);
        resolve();
      })
    })
  }
};
