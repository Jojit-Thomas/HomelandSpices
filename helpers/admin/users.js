const { Types, trusted } = require("mongoose");
const user_model = require("../../model/user_model");

module.exports = {
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      user_model.find().then((users) => {
        resolve(users);
      });
    });
  },
  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      user_model.deleteOne({ _id: Types.ObjectId(id) }).then((done) => {
        if (done) {
          resolve(done);
        } else {
          console.log("some error happened");
        }
      });
    });
  },
  addUser: (data) => {
    console.log(data);
    data.email = data.email.toLowerCase();
    return new Promise(async (resolve, reject) => {
      let response = {};
      user_model.findOne({ email: data.email }).then((dbValue) => {
        console.log(dbValue);
        if (dbValue) {
          response.status = false;
          response.error = "Email already registered";
          resolve(response);
        } else {
          user_model.create(data).then((result) => {
            console.log(result);
            response.result = result.insertedId;
            response.status = true;
            resolve(response);
          });
        }
      });
    });
  },
  blockUnblock: (id) => {
    return new Promise((resolve, reject) => {
      user_model.findOne({ _id: Types.ObjectId(id) }).then((result) => {
        if (result.isAllowed) {
          user_model
            .updateOne(
              { _id: Types.ObjectId(id) },
              { $set: { isAllowed: false } }
            )
            .then((status) => {
              resolve(status);
            });
        } else {
          user_model
            .updateOne(
              { _id: Types.ObjectId(id) },
              { $set: { isAllowed: true } }
            )
            .then((status) => {
              resolve(status);
            });
        }
      });
    });
  },
};
