// const { db } = require("../../config/connection");
const bcrypt = require("bcrypt");
const user_model = require("../../model/user_model.js");
const { generateBcrypt } = require("../bcrypt.js");

module.exports = {
  doSignUp: (data) => {
    let { name, email, phone, password } = data;
    data.email = data.email.toLowerCase();
    return new Promise( (resolve, reject) => {
      let response = {};
      console.log(data.phone, data.email)
      // Checking the phone number and email is unique
      user_model.findOne({ $or:[{phone: data.phone}, {email: data.email}]  }).then(async(dbValue) => {
        console.log(dbValue);
        if (dbValue) {
          response.status = false;
          response.error = "phone already registered";
          resolve(response);
        } else {
            let password = await generateBcrypt(data.password);
            delete data.confirmPassword;
            user_model
              .create({
                name: name,
                email: email,
                phone: phone,
                password: password,
                isAllowed: true,
              })
              .then((result) => {
                console.log(result);
                response.result = result.insertedId;
                response.status = true;
                resolve(response);
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
          if (!user.isAllowed) {
            response.status = false;
            response.blocked = true;
            // console.log('blocked')
            resolve(response);
          } else {
            console.log(data.password,"    ", user.password);
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
          }
        } else {
          response.error = "User not found";
          console.log("Login Failed");
          resolve(response);
        }
      });
    });
  },
  getUser: (phone) => {
    return new Promise((resolve, reject) => {
      user_model.findOne({ phone: phone }).then((user) => {
        if (user) {
          resolve(user);
        } else {
          resolve(false);
        }
      });
    });
  },
};
