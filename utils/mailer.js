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
  sendMail: async (receiver, link) => {
    try {
      let info = await transporter.sendMail({
        from: "Admin",
        to: receiver,
        subject: "typowanie",
        text: "Welcome " + process.env.CLIENT_URL + "/set-password/" + link,
        html: `<h1>Witaj!</h1><p>${process.env.CLIENT_URL}/set-password/${link}</p>`,
      });
    } catch (err) {
      console.error("Error occurred:", err);
    }
  },
};
