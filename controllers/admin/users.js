const {
  getAllUsers,
  deleteUser,
  addUser,
  blockUnblock,
  getUserCount,
} = require("../../helpers/admin/users");
const bcrypt = require("bcrypt");
const { getUser, updateUser } = require("../../helpers/common");
module.exports = {
  getUsers: async (req, res) => {
    let {limit = 10, page = 1, sort = -1, sortValue = 'date'} = req.query;
    let orderCount = await getUserCount()//get the total number of documents ordered
    let pageLimit = Math.ceil(orderCount / limit)//divide total number of order document / limit 
    page = (page < 1) ? 1 : (page > pageLimit) ? pageLimit : page; // if the page is less than 1 then make it 1 and if the page is greater than pageLimit then make it pageLimit
    const offset = (page - 1) * limit;//the start index of the document
    let users = await getAllUsers(offset, limit, sort, sortValue)//fetch document from the server
    res.render("admin/view_users", { admin: true, users: users, pageLimit : pageLimit, currentPage: page,limit : limit  });
  },
  getdeleteUser: (req, res) => {
    deleteUser(req.params.userId).then((done) => {
      if (done) {
        res.redirect("/admin/users");
      } else {
        res.send("some error occured");
      }
    });
  },
  getEditUser: (req, res, next) => {
    getUser(req.params.userId).then((user) => {
      console.log(user);
      res.render("admin/edit_user", {admin: true, user: user });
    }).catch((err) => {
      next(err);
    })
  },
  postEditUser: (req, res) => {
    console.log(req.body);
    bcrypt.hash(req.body.password, 10).then((pass) => {
      req.body.password = pass;
      updateUser(req.params.userId, req.body).then((state) => {
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
    blockUnblock(req.params.userId).then(() => {
        res.redirect("/admin/users");
    })
  },
};
