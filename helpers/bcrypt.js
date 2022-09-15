const bcrypt = require("bcrypt");

module.exports.generateBcrypt = (password) => {
    return new Promise(async (resolve, reject) => {
      try{
        let hashedPassword = await bcrypt.hash(password, 8);
        resolve(hashedPassword)
      } catch (err) {
        console.log(err);
      }
    });
  }