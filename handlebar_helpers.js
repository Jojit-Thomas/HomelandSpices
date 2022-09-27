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
    handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

      switch (operator) {
          case '==':
              return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
              return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
              return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
              return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
              return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
              return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
              return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
              return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
              return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
              return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
              return options.inverse(this);
      }
  });
    handlebars.registerHelper("divide", function (arg1, arg2, options) {
      // console.log(arg1 + "<" + arg2);
      return Math.floor(arg1 / arg2) ? options.fn(this) : options.inverse(this);
    });
    handlebars.registerHelper('index_of', function(context,ndx,property) {
      return context[ndx][property];
    });
    handlebars.registerHelper('times', function(from, n, block) {
      var accum = '';
      for(var i = from; i <= n; ++i)
          accum += block.fn(i);
      return accum;
  });
    next();
  },
};
