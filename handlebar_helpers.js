const { handlebars } = require("hbs");

module.exports = {
  hbs_helpers: (req, res, next) => {
    handlebars.registerHelper("inc", function (value, options) {
      return parseInt(value) + 1;
    });
    handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
      // console.log(arg1 + "=" + arg2);
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });
    next();
  },
};
