const nodemailer = require("nodemailer");
require("dotenv").config();
const email = {
  service: process.env.NODEMAILER_SERVICE,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
};
const transporter = nodemailer.createTransport(email);
module.exports = {
  sendMail: async (receiver, username, link) => {
    try {
      let info = await transporter.sendMail({
        from: "Admin",
        to: receiver,
        subject: "typowanie",
        text:
          "Welcome " +
          username +
          " " +
          process.env.CLIENT_URL +
          "/set-password/" +
          link,
      });
    } catch (err) {
      console.error("Error occurred:", err);
    }
  },
};
