const {
  getAllUsers,
  deleteUser,
  addUser,
  blockUnblock,
} = require("../../helpers/admin/users");
const bcrypt = require("bcrypt");
const { getUser, updateUser } = require("../../helpers/common");
module.exports = {
  getUsers: (req, res) => {
    getAllUsers().then((users) => {
      console.log(users);
      res.render("admin/view_users", { admin: true, users: users });
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
      res.render("admin/edit_user", {admin: true, user: user });
    });
  },
  postEditUser: (req, res) => {
    console.log(req.body);
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
    res.render("admin/add_user", { admin: true });
  },
  postAddUser: (req, res) => {
    bcrypt.hash(req.body.password, 10).then((pass) => {
      req.body.password = pass;
      addUser(req.body).then((state) => { 
        if(state) {
          res.redirect("/admin/users");
        }
      })
    })
  },
  getBlockUser: (req, res) => {
    blockUnblock(req.params.id).then((status) => {
      if(status) {
        res.redirect("/admin/users");
      } else {
        
      }
    })
  },
};
