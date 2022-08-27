const jwt = require("jsonwebtoken");
const { doSignUp, doSignIn } = require("../../helpers/user/authentication");
require("dotenv").config();
module.exports = {
  userAuth: (req, res, next) => {
    const token = req.cookies.token;
    console.log("token", token);
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
          res.clearCookie("token");
          res.redirect("/signin");
        } else {
          // req.user = user;
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
    res.render("user/authentication/signIn", { title: "User Login" });
  },
  getSignUp: (req, res) => {
    res.render("user/authentication/signUp", { title: "User Login" });
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
        // req.session.loginErr = "Username or password incorrect";
        res.status(404).send({ message: response.error });
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
};
