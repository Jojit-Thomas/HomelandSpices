const {
  getAllUsers,
  deleteUser,
  getUser,
  updateUser,
} = require("../../helpers/admin/users");
const bcrypt = require("bcrypt");
const { request } = require("express");
module.exports = {
  getUsers: (req, res) => {
    getAllUsers().then((users) => {
      console.log(users);
      res.render("admin/users", { users: users });
    });
  },
  getdeleteUser: (req, res) => {
    deleteUser(req.params.id).then((done) => {
      if (done) {
        res.redirect("/admin/users");
      } else {
        res.send("some error occured");
      }
    });
  },
  getEditUser: (req, res) => {
    getUser(req.params.id).then((user) => {
      console.log(user);
      res.render("admin/edit_user", { user: user });
    });
  },
  postEditUser: (req, res) => {
    bcrypt.hash(req.body.password, 10).then((pass) => {
      req.body.password = pass;
      updateUser(req.params.id, req.body).then((state) => {
        if(state) {
          res.redirect("/admin/users");
        }
      })
    })
  },
  getAddUser: (req, res) => {
    bcrypt.hash(req.body.password, 10).then((pass) => {
      req.body.password = pass;
      
    })
  }
};
