const {
  addAddress,
  getAddress,
  deleteAddress,
  getAddressCount,
  getAddressById,
  updateAddress,
} = require("../../helpers/user/address");
const { getTotalAmount } = require("../../helpers/user/cart");

module.exports = {
  getNewAddressPage: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let count = await getAddressCount(user.userId)
    if(count < 6){
      res.render("user/address/add_address", { user: user });
    } else {
      res.status(429).json({message: "Maximum number of address added"})
    }
  },
  getNewUserAddressPage: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let count = await getAddressCount(user.userId)
    console.log(count)
    if(count < 5){
      res.render("user/profile/add_address", { user: user });
    } else {
      res.status(429).json({message: "Maximum number of address added"})
    }
  },
  postNewAddress: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    addAddress(req.body, user.userId).then((address) => {
      res.status(200).json({status: true})
    });
  },
  getAddressPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    // console.log(user);
    getTotalAmount(user.userId).then((amount) => {
      getAddress(user.userId).then((address) => {
        console.log(address);
        res.render("user/address/address", {
          order: amount,
          address: address,
          user: user,
        });
      });
    });
  },
  postAddressSelection: (req, res) => {
    console.log(req.body);
    if(req.body.address !== "address_not_selected") {
      res.status(200).json(req.body.address);
    } else {
      res.status(400).json("Please select a address to proceed")
    }
  },
  getDeleteAddress: (req, res) => {
    deleteAddress(req.params.id).then(() => {
      res.status(200).json({ status: true });
    });
  },
  getEditAddressPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    getAddressById(req.params.addressId).then((address) => {
      console.log(address)
      res.render("user/address/edit_address", {user : user, address : address})
    })
  },
  postEditAddress: (req, res) => {
    updateAddress(req.params.addressId, req.body).then((data) => {
      res.status(200).json(true);
    })
  }
};
