const { handlebars } = require("hbs");

module.exports = {
  hbs_helpers: (req,res, next) => {
    handlebars.registerHelper("inc", function (value, options) {
      return parseInt(value) + 1;
    });
    next();
  },
};
