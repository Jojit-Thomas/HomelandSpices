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
      const {
        name,
        phone,
        locality,
        city,
        pincode,
        state,
        houseName,
        landmark,
        postOffice
      } = body;
      let addressObj = {
        userId: userId,
        name: name,
        phone: phone,
        locality: locality,
        city: city,
        state: state,
        pincode: Number(pincode),
        houseName: houseName,
        landmark: landmark,
        postOffice: postOffice,
      };
      address_model.create(addressObj).then((state) => {
        resolve(state);
      });
    });
  },
  addCheckoutAddress: (address) => {
    console.log("address is : ", address);
    const {
      name,
      phone,
      locality,
      city,
      pincode,
      state,
      houseName,
      landmark,
      userId,
      postOffice,
    } = address;
    let addressObj = {
      userId: userId,
      name: name,
      phone: phone,
      locality: locality,
      city: city,
      state: state,
      pincode: Number(pincode),
      houseName: houseName,
      landmark: landmark,
      postOffice: postOffice,
    };
    return new Promise((resolve, reject) => {
      order_address_model.create(addressObj).then((state) => {
        resolve(state);
      });
    });
  },
};
