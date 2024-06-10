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
        html: `<h1>Drogi Typerze,</h1>

                <p>Cieszymy się, że zdecydowałeś się dołączyć do naszej społeczności miłośników sportowych emocji! Jesteśmy gotowi na kolejną rundę ekscytujących rywalizacji i nie możemy się doczekać, aby zobaczyć Twoje typy.</p>

                <p>Rozpocznij swoją przygodę już teraz! Kliknij poniższy link, aby się zarejestrować i rozpocząć obstawianie:</p>

                <a href="${process.env.CLIENT_URL}/set-password/${link}">Zarejestruj się tutaj</a>

                <p>Po zakończeniu rejestracji otrzymasz dostęp do wszystkich funkcji naszej platformy, w tym możliwość typowania wyników, śledzenia swoich postępów oraz interakcji z innymi uczestnikami.</p>

                <p>Jeżeli masz jakiekolwiek pytania lub potrzebujesz pomocy, skontaktuj się z nami. Jesteśmy tutaj, aby wspierać Cię na każdym kroku!</p>

                <p>Dziękujemy za dołączenie. Życzymy szczęścia i dobrego oka w typowaniu!</p>

                <p>Pozdrawiam,</p>
                <p></p>Admin</p>`,
      });
    } catch (err) {
      console.error("Error occurred:", err);
    }
  },
};
