const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
var Sib = require('sib-api-v3-sdk');
require("dotenv").config();
const crypto = require("crypto");
const {
  doSignUp,
  doSignIn,
  getUser,
  createResetToken,
  isEmailExist,
  isResetTokenValid,
  reset_password,
  findUserByRefralCode,
} = require("../../helpers/user/authentication");
const { generateBcrypt } = require("../../helpers/bcrypt");
const { addToWallet, addWalletTransaction } = require("../../helpers/common");
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
  postSignUp: async (req, res) => {
    try{
    let response = await doSignUp(req.body)
      if (response.status) {
      let refral_valid ;
      if(req.body.refral_code) {
        let referer = await findUserByRefralCode(req.body.refral_code)
        if(referer) {
          refral_valid = true;
          await addToWallet(referer._id, 100)
          await addWalletTransaction(referer._id, `₹100 Added for refering ${req.body.name}`, 100)
        }  
      }
        res.status(200).redirect("/signin");
      }
    }catch(err) {
      res.status(err.status).json(err.message)
    }
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
  getForgotPasswordPage: (req, res) => {
    let user = req.cookies.user ? req.cookies.user : null;
    res.render("user/authentication/forgot_password",{user: user})
  },
  forgotPassword: async (req, res) => {
    try{
      let user = await isEmailExist(req.body.email.trim().toLowerCase())
      let token = await createRandomBytes(128);
      console.log("user is : ",token)
      await createResetToken(user.email, token);
      await sendForgotMail(user.email, token);
      console.log("sending response")
      res.status(200).json(user.email)
    } catch(err) {
      if(err.status === 404) {
        res.status(404).json("Email is not registered")
      }
    }
  },
  resetForgotPasswordPage: async (req, res) => {
    let user = req.cookies.user? req.cookies.user : null;
    try{
      const {token} = req.params;
      let email = req.cookies.email? req.cookies.email : createHttpError.BadRequest();
      let reset_token = await isResetTokenValid(email, token)
      console.log("reset_token", reset_token);
      res.render("user/authentication/reset_forgot_password",{user: user, email: email})
    } catch(err) {
      if (err.status === 400) res.render("errors/reset_password_400",{user: user})
    }
  },
  resetForgotPassword: async (req, res) => {
    try{
      let {email, password} = req.body;
      password = await generateBcrypt(password);
      await reset_password(email, password);
      res.status(200).json("Password changed successfully")
    } catch(err) {
      console.log(err)
    }
  }

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
function createRandomBytes(length) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(
      length,
      (err, bytes) => {
        if (err) reject(createHttpError.InternalServerError());
        else resolve(bytes.toString('hex'));
      }
    );
  })
}
function sendForgotMail(mail, token) {
    return new Promise((resolve, reject) => {
      console.log(mail, token);
    let defaultClient = Sib.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
    const tranEmailApi = new Sib.TransactionalEmailsApi()
    const sender = {
        email: 'homelandspices@outlook.com',
        name: 'Homelandspices',
    }
    const receivers = [
        {
            email: mail,
        },
    ]
    try{
      tranEmailApi
    .sendTransacEmail({
        sender,
        to: receivers,
        subject: 'Your HomelandSpices password reset request',
        // textContent: `
        // This text will be replaced by the html content{{params.role}}.         params: {role: 'Frontend',},
        // `,
        htmlContent: `
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr>
            <td style="height:80px;">&nbsp;</td>
          </tr>
          <tr>
           
          </tr>
          <tr>
            <td style="height:20px;">&nbsp;</td>
          </tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr>
                  <td style="height:40px;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Forgot Password </h1>
                    <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                      A request has been received to change the password for your HomelandSpices
                    </p>
                    <a href="localhost:3000/password/forgot/${token}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                      Password</a>
                  </td>
                </tr>
                <tr>
                  <td style="height:40px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          <tr>
            <td style="height:20px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="height:80px;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
                `,

    })
    .then(function(data) {
      console.log(data);
      resolve();
    }, function(error) {
      console.error(error);
    });

    } catch(err) {
      console.log(err);
    }
    })
}