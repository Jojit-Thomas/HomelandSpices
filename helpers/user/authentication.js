// const { db } = require("../../config/connection");
const bcrypt = require("bcrypt");
const user_model = require("../../model/user_model.js");

module.exports = {
  doSignUp: (data) => {
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
          bcrypt.hash(data.password, 10).then((result) => {
            data.password = result;
            delete data.confirmPassword;
            user_model.create(data).then((result) => {
              console.log(result);
              response.result = result.insertedId;
              response.status = true;
              resolve(response);
            });
          });
        }
      });
    });
  },
  doSignIn: (data) => {
    return new Promise(async (resolve, reject) => {
      data.email = data.email.toLowerCase();
      let loginStatus = false;
      let response = {};
      user_model.findOne({ email: data.email }).then((user) => {
        if (user) {
          bcrypt.compare(data.password, user.password).then((status) => {
            if (status) {
              console.log("Login Success");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              response.status = false;
              response.error = "Incorrect password";
              console.log("Login Failed");
              resolve(response);
            }
          });
        } else {
          response.error = "User not found";
              console.log("Login Failed");
              resolve(response);
        }
      });
    });
  },
};
