const { addAddress, getAddress } = require("../../helpers/user/address");
const { getTotalAmount } = require("../../helpers/user/cart");

module.exports = {
  getNewAddressPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    res.render("user/add_address", { user: user });
  },
  postNewAddress: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    addAddress(req.body, user.userId).then((address) => {
      res.redirect("/address");
    });
  },
  getAddressPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    // console.log(user);
    getTotalAmount(user.userId).then((total) => {
      getAddress(user.userId).then((address) => {
        console.log(address);
        res.render("user/address", {
          total: total,
          address: address,
          user: user,
        });
      });
    });
  },
  postAddressSelection: (req, res) => {
    console.log(req.body)
    res.cookie("address", req.body.address, { maxAge: 24*60*60*1000, httpOnly: true });
    res.redirect("/payment");
  }
};
