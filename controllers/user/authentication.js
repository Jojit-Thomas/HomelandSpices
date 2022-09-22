const { response } = require("express");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
require("dotenv").config();
const {
  doSignUp,
  doSignIn,
  getUser,
} = require("../../helpers/user/authentication");
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
module.exports = {
  verifyLogin: (req, res, next) => {
    const token = req.cookies.token;
    verifyAccessToken(token)
      .then(() => {
        next();
      })
      .catch((err) => {
        console.error("Error is ", err.message);
        res.clearCookie("token");
        res.redirect("/signin");
        // next(err);
      });
  },
  // this is to prevent the user from login twice
  stopAuthenticate: (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
      verifyAccessToken(token)
        .then(() => {
          res.redirect("/");
        })
        .catch((err) => {
          console.error("Error is ", err.message);
          res.clearCookie("token");
          res.redirect("/signin");
          // next(err);
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
        let payload = {
          username: response.user.name,
          userId: response.user._id,
        };
        // signs a new jwt and store in cookie
        signAccessToken(payload).then((token) => {
          res.cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
          });
          // saves username and userId in cookie for future operations
          res.cookie("user", payload, {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: true,
          });
          res.redirect("/");
        });
      } else {
        // check is the user blocked by the admin
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
    getUser(phone).then((user) => {
      if (user) {
        // twilio otp verify: create is used here
        client.verify.v2
          .services(process.env.TWILIO_SERVICE_ID)
          .verifications.create({ to: `+91${phone}`, channel: "sms" })
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
    console.log(phone, "BODY", otp);
    //twilio otp verify function
    client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks.create({ to: `+91${phone}`, code: Number(otp) })
      .then((verification_check) => {
        console.log(verification_check);
        if (verification_check.valid) {
          console.log(phone);
          // get the user data and generate jwt token
          getUser(phone).then((user) => {
            if (user) {
              console.log(user);
              let payload = {
                username: user.name,
                userId: user._id,
              };
              // signs a new jwt and store in cookie
              signAccessToken(payload).then((token) => {
                res.cookie("token", token, {
                  maxAge: 24 * 60 * 60 * 1000,
                  httpOnly: true,
                });
                // saves username and userId in cookie for future operations
                res.cookie("user", payload, {
                  maxAge: 365 * 24 * 60 * 60 * 1000,
                  httpOnly: true,
                });
                res.redirect("/");
              });
            } else {
              res
                .status(401)
                .json({ message: "NO user with this phone number" });
            }
          });
        } else {
          res.status(401).json({ message: "Otp doesn't match" });
        }
      });
  },
  getLogout: (req, res) => {
    res.clearCookie("token");
    res.clearCookie("address");
    res.clearCookie("user");
    res.redirect("/");
  },
};
function verifyAccessToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
      if (err) {
        const Error =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        reject(createHttpError.Unauthorized(Error));
      } else {
        resolve();
      }
    });
  });
}
function signAccessToken(payload) {
  return new Promise((resolve, reject) => {
    const options = {
      expiresIn: "1d",
      issuer: "Homelandspices.com",
    };
    jwt.sign(
      JSON.parse(JSON.stringify(payload)),
      process.env.ACCESS_TOKEN_SECRET_KEY,
      options,
      (err, token) => {
        if (err) reject(createHttpError.InternalServerError());
        else resolve(token);
      }
    );
  });
}
function signRefreshToken(payload) {
  return new Promise((resolve, reject) => {
    const options = {
      expiresIn: "1y",
      issuer: "Homelandspices.com",
    };
    jwt.sign(
      JSON.parse(JSON.stringify(payload)),
      process.env.REFRESH_TOKEN_SECRET_KEY,
      options,
      (err, token) => {
        if (err) reject(createHttpError.InternalServerError());
        else resolve(token);
      }
    );
  });
}
