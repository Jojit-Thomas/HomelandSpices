const bcrypt = require("bcrypt");
const { getUser, updateUser, changePassword } = require("../../helpers/common");
const { getAddress } = require("../../helpers/user/address");
const { generateBcrypt } = require("../../helpers/bcrypt");
const createHttpError = require("http-errors");

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
    console.log(req.body);
    req.body.password = "";
    updateUser(user.userId, req.body).then((user) => {
      res.status(200).json({ success: true });
    });
  },
  getChangePassword: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    res.render("user/authentication/changePassword", { user: user });
  },
  postChangePassword: async (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    let { oldPassword, password } = req.body;
    let existing_user = await getUser(user.userId);
    let valid = await bcrypt.compare(oldPassword, existing_user.password);
    if (valid) {
      password = await generateBcrypt(password);
      changePassword(user.userId, password).then(() => {
        res.status(200).json({ success: true });
      });
    } else {
      res.status(401).json({ message: "You'r old password is wrong" });
    }
  },
};
