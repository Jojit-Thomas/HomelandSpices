// const { db } = require("../../config/connection");
const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");
const { Types } = require("mongoose");
const forgot_password = require("../../model/forgot_password.js");
const user_model = require("../../model/user_model.js");
const { generateBcrypt } = require("../bcrypt.js");
const randomstring = require("randomstring");
const { addWalletTransaction } = require("../common.js");

module.exports = {
  doSignUp: (data) => {
    let { name, email, phone, password } = data;
    data.email = data.email.toLowerCase();
    return new Promise( (resolve, reject) => {
      let response = {};
      console.log(data.phone, data.email)
      // Checking the phone number and email is unique
      user_model.findOne({ $or:[{phone: data.phone}, {email: data.email}]  }).then(async(dbValue) => {        
        if (dbValue) {
          reject(createHttpError.Conflict("Phone or Email already registered"))
        } else {
            let password = await generateBcrypt(data.password);
            const date = new Date();
            let refral_code = randomstring.generate({
              length: 8,
              charset: 'alphabetic'
            });
            user_model
              .create({
                name: name,
                email: email,
                phone: phone,
                password: password,
                isAllowed: true,
                wallet: 0,
                date: date,
                refral_code : refral_code,
              })
              .then(async (result) => {
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
  isEmailExist: (email) => {
    return new Promise((resolve, reject) => {
      user_model.findOne({email: email}).then((user) => {
        (user) ? resolve(user) : reject(createHttpError.NotFound());
      })
    })
  },
  createResetToken: (email, token) => {
    return new Promise((resolve, reject) => {
      try{
        let current_date = new Date()
        let date = new Date(current_date.getTime() + 720 * 1000)
        console.log("date", current_date, date)
        forgot_password.updateOne({email : email},{email: email,token: token, modifiedAt: date },{upsert: true})
      .then((data) => {console.log(data); resolve()})
      .catch((err) => {console.log(err); reject(createHttpError.InternalServerError())})
      } catch(err) {
        console.log(err)
      }
    })
  },
  isResetTokenValid: (email, token) => {
    return new Promise((resolve, reject) => {
      forgot_password.findOne({email : email, token : token, modifiedAt: {$gt:  new Date()}}).then((valid) => {
        (valid) ? resolve(valid) : reject(createHttpError.BadRequest())
      })
    })
  },
  reset_password: (email, password) => {
    return new Promise((resolve, reject) => {
      user_model.updateOne({email: email}, {password: password}).then(() => resolve()).catch((err) => {
        console.error(err);
        reject(createHttpError.InternalServerError())
      })
    })
  },
  findUserByRefralCode: (refral_code) => {
    return new Promise((resolve, reject) => {
      user_model.findOne({refral_code: refral_code}).then((user) => {
        user? resolve(user) : reject(createHttpError.Unauthorized())
      })
    })
  }
}
