const nodemailer = require("nodemailer");
const email = {
  service: "gmail",
  auth: {
    user: "filipupcia13@gmail.com",
    pass: "ucqr dyrj qxlg ixxw",
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
          " http://192.168.0.141:3000/set-password/" +
          link,
      });
    } catch (err) {
      console.error("Error occurred:", err);
    }
  },
};
