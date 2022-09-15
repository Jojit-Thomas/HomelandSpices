const bcrypt = require('bcrypt');
const { getUser, updateUser } = require("../../helpers/common");
const { getAddress } = require("../../helpers/user/address");

module.exports = {
  getProfilePage: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let address = await getAddress(user.userId);
    let userDetails = await getUser(user.userId);
    console.log(address);
    res.render("user/profile", {
      user: user,
      address: address,
      userDetails: userDetails,
    });
  },
  postEditUser: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    console.log(req.body)
    req.body.password = ''
    updateUser(user.userId, req.body).then((user) => {
      res.status(200).json({success: true})
    })
  },
  getChangePassword: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    res.render("user/authentication/changePassword", {user: user})
  },
  postChangePassword: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    getUser(user.userId).then(async(user) => {
      let valid = bcrypt.compare(req.body.oldPassword, user.password)
      if(valid){
        // updateUser(user.userId, req.body).then((user) => {
        //   res.status(200).json({success: true})
        // })
      } else {
        res.status(401).json({message: "Old password is wrong"})
      }
    })
  }
};
