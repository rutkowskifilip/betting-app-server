const nodemailer = require("nodemailer");
require("dotenv").config();
const email = {
  service: process.env.NODEMAILER_SERVICE,
  host: process.env.NODEMAILER_HOST,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
};
const transporter = nodemailer.createTransport(email);
module.exports = {
  sendMail: async (receiver, link) => {
    try {
      await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log("Server is ready to take our messages");
            resolve(success);
          }
        });
      });
      let info = await transporter.sendMail({
        from: `Admin ${process.env.NODEMAILER_USER}`,
        to: receiver,
        subject: "typowanie",
        html: `<h2>Drogi Typerze,</h2></br><p>Cieszymy się, że zdecydowałeś się dołączyć do naszej społeczności miłośników sportowych emocji! Jesteśmy gotowi na kolejną rundę ekscytujących rywalizacji i nie możemy się doczekać, aby zobaczyć Twoje typy.</p></br><p>Rozpocznij swoją przygodę już teraz! Kliknij poniższy link, aby się zarejestrować i rozpocząć obstawianie:</p></br><a href="${process.env.CLIENT_URL}/set-password/${link}">Zarejestruj się tutaj</a></br></br><p>Po zakończeniu rejestracji otrzymasz dostęp do wszystkich funkcji naszej platformy, w tym możliwość typowania wyników, śledzenia swoich postępów oraz interakcji z innymi uczestnikami.</p></br><p>Jeżeli masz jakiekolwiek pytania lub potrzebujesz pomocy, skontaktuj się z nami. Jesteśmy tutaj, aby wspierać Cię na każdym kroku!</p></br><p>Dziękujemy za dołączenie. Życzymy szczęścia i dobrego oka w typowaniu!</p></br><p>Pozdrawiam,</p><p style="font-size:1.2em">Admin</p>`,
      });
      console.log("Email sent:", info.response);
      return info.response;
    } catch (err) {
      console.error("Error occurred:", err);
      return "error";
    }
  },
};
