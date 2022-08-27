const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const mongoose = require("mongoose");
const hbs = require("hbs");
const fileUpload = require("express-fileupload");
const { hbs_helpers } = require("./handlebar_helpers");
// const { connect } = require('./config/connection');

const app = express();

// view engine setup
const partialsPath = path.join(__dirname, "./views/partials");
hbs.registerPartials(partialsPath);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(hbs_helpers);

mongoose.connect(
  "mongodb://localhost:27017/HomelandSpices",
  () => console.log("db connected"),
  () => console.log("db error")
);


app.use("/admin", adminRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
