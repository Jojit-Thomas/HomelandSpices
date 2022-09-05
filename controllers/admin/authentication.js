const express = require("express");
const { doSignIn } = require("../../helpers/admin/authentication");
const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = {
  adminAuth: (req, res, next) => {
    const token = req.cookies.adminToken;
    console.log("token", token);
    try {
      jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
          res.clearCookie("adminToken");
          res.redirect("/admin/signin");
        } else {
          // req.user = user;
          next();
        }
      });
    } catch (err) {
      res.clearCookie("adminToken");
      res.redirect("/admin");
    }
  },
  stopAuthenticate: (req, res, next) => {
    const token = req.cookies.adminToken;
    if (token) {
      jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
          res.clearCookie("adminToken");
          next();
        } else {
          res.redirect("/admin");
        }
      });
    } else {
      next();
    }
  },
  getSignIn: (req, res) => {
    res.render("admin/authentication/signIn", { title: "Admin Login", noHeader: true });
  },
  postSignIn: (req, res) => {
    doSignIn(req.body).then((response) => {
      if (response.status) {
        console.log(typeof response);
        const token = jwt.sign(
          response.user.toJSON(),
          process.env.ADMIN_ACCESS_TOKEN_SECRET_KEY,
          { expiresIn: "1h" }
        );
        res.cookie("adminToken", token);
        res.redirect("/admin");
      } else {
        console.log(response);
        res.status(404).send({ message: response.error });
      }
    });
  },
};
