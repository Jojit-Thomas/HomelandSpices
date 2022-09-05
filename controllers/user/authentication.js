const { response } = require("express");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
require("dotenv").config();
const {
  doSignUp,
  doSignIn,
  getUser,
} = require("../../helpers/user/authentication");
let OTP = 0;
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
module.exports = {
  verifyLogin: (req, res, next) => {
    const token = req.cookies.token;
    console.log("token", token);
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
          res.clearCookie("token");
          res.redirect("/signin");
        } else {
          // req.user = user;
          // console.log(user);
          let userObj = {
            username : user.name,
            userId: user._id
          }
          // console.log(userObj);
          res.cookie("user", userObj, { maxAge: 24*60*60*1000, httpOnly: true });
          next();
        }
      });
    } catch (err) {
      res.clearCookie("token");
      res.redirect("/");
    }
  },
  stopAuthenticate: (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
          res.clearCookie("token");
          next();
        } else {
          res.redirect("/");
        }
      });
    } else {
      next();
    }
  },
  getSignIn: (req, res) => {
    res.render("user/authentication/signIn", {
      title: "User Signin",
      noHeader: true,
    });
  },
  getSignUp: (req, res) => {
    
    res.render("user/authentication/signUp", {
      title: "User Signup",
      noHeader: true,
    });
  },
  postSignIn: (req, res) => {
    doSignIn(req.body).then((response) => {
      if (response.status) {
        console.log(typeof response);
        const token = jwt.sign(
          response.user.toJSON(),
          process.env.ACCESS_TOKEN_SECRET_KEY,
          { expiresIn: "7d" }
        );
        res.cookie("token", token);
        res.redirect("/");
      } else {
        console.log(response);
        if (response.blocked) {
          console.log("blocked");
          res.status(404).send({ message: "You are Blocked by the admin" });
        } else {
          console.log("notblocked");
          res.status(404).send({ message: response.error });
        }
        // req.session.loginErr = "Username or password incorrect";
        // res.redirect("/login");
      }
    });
  },
  postSignUp: (req, res) => {
    doSignUp(req.body).then((response) => {
      console.log(response);
      if (response.status) {
        res.status(200).redirect("/signin");
      } else {
        res.status(404).send({ message: response.error });
      }
    });
  },
  getBlocked: (req, res) => {
    res.render("user/authentication/blocked");
  },
  getOtpSigninPage: (req, res) => {
    res.render("user/authentication/otp_signin", { noHeader: true });
  },
  postGetOtp: (req, res) => {
    const { phone } = req.body;
    setTimeout(() => {
      OTP = generateOTP();
    }, 300000);
    OTP = generateOTP();
    console.log(OTP);
    getUser(phone).then((user) => {
      if (user) {
       
        client.verify.v2
          .services(process.env.TWILIO_SERVICE_ID)
          .verifications.create({ to: `+91${phone}`, channel: "sms"})
          .then((verification) => {
            res.status(200).send({ message: "Otp send successfully" });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        res.status(404).send({ message: "No user with this phone number" });
      }
    });
  },
  postVerifyOtp: (req, res) => {
    const { otp, phone } = req.body;
    console.log(phone, "BODY", otp, "PRE", OTP);

    client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to: `+91${phone}`, code: Number(otp) })
      .then((verification_check) => {
        console.log(verification_check);
        if (verification_check.valid) {
          console.log(phone);
          getUser(phone).then((user) => {
            if (user) {
              console.log(user);
              const token = jwt.sign(
                user.toJSON(),
                process.env.ACCESS_TOKEN_SECRET_KEY,
                { expiresIn: "7d" }
              );
              res.cookie("token", token);
              res.redirect("/");
            } else {
              res
                .status(401)
                .send({ message: "NO user with this phone number" });
            }
          });
        } else {
          res.status(401).send({ message: "Otp doesn't match" });
        }
      });
  },
  getLogout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
  },
};
function generateOTP() {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
