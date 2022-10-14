const {
  addAddress,
  getAddress,
  deleteAddress,
  getAddressCount,
} = require("../../helpers/user/address");
const { getTotalAmount } = require("../../helpers/user/cart");

module.exports = {
  getNewAddressPage: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let count = await getAddressCount(user.userId)
    if(count < 6){
      res.render("user/add_address", { user: user });
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
        res.render("user/address", {
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
};
