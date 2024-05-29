const bcrypt = require("bcrypt");
module.exports = {
  encryptPass: async (password) => {
    let encryptedPassword = await bcrypt.hash(password, 10);
    return encryptedPassword;
  },

  decryptPass: async (userpass, encrypted) => {
    let decrypted = await bcrypt.compare(userpass, encrypted);
    return decrypted;
  },
};
