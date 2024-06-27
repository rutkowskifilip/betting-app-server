const express = require("express");
const router = express.Router();

const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");
const mailer = require("../utils/mailer");
const db = require("../utils/db");
const auth = require("../utils/auth");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT id,password FROM users  WHERE username=?;",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Błąd wewnętrzny serwera");
        return;
      }
      if (results.length > 0) {
        const userId = results[0].id;
        if (await bcrypt.decryptPass(password, results[0].password)) {
          const token = await jwt.createToken({ id: userId }, "1h");
          res.setHeader("Authorization", "Bearer " + token);
          return res.send({ id: userId, token: token });
        } else {
          return res.status(409).send("Hasło jest niepoprawne");
        }
      } else {
        return res.status(409).send("Użytkownik z taką nazwą nie istnieje");
      }
    }
  );
});

router.post("/setPassword", async (req, res) => {
  const password = await bcrypt.encryptPass(req.body.password);
  const username = req.body.username;
  const auth = req.body.auth;
  const email = await jwt.verifyToken(auth);

  db.query(
    "SELECT * FROM users WHERE username = ?;",
    [username],
    (err, existingUser) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Błąd wewnętrzny serwera");
        return;
      }

      if (existingUser.length > 0) {
        // Username already exists
        return res
          .status(409)
          .send("Nazwa użytkownika zajęta. Proszę wybrać inną.");
      }

      db.query(
        "INSERT INTO users SET email=?, password= ?, username=?",
        [email, password, username],
        (err, results) => {
          if (err) {
            console.error("Error querying database:", err);
            return res.status(500).send("Błąd wewnętrzny serwera");
          }

          if (results.affectedRows > 0) {
            res.status(200).send("Dane użytkownika zapisane poprawnie");
          } else {
            // console.warn("Bład! Rządanie nie wpłynęło na żadne wiersze");
            res
              .status(400)
              .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
          }
        }
      );
    }
  );
});

router.post("/add", auth, async (req, res) => {
  const email = req.body.email;

  db.query(
    "SELECT * FROM created_users WHERE email = ?",
    email,
    (err, existingUser) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Błąd wewnętrzny serwera");
        return;
      }

      if (existingUser.length > 0) {
        res.status(409).send("Adres email zajęty. Proszę użyć innego");
        return;
      }

      // Email is available, proceed with user creation
      db.query(
        "INSERT INTO created_users (email) VALUES (?)",
        email,
        async (err, results) => {
          if (err) {
            console.error("Error querying database:", err);
            res.status(500).send("Błąd wewnętrzny serwera");
            return;
          }

          if (results.affectedRows > 0) {
            const token = await jwt.createToken(email, "72h");
            const mail = await mailer.sendMail(email, token);
            console.log(mail);
            res.status(200).send("Użytkownik stworzony poprawnie");
          } else {
            res
              .status(400)
              .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
          }
        }
      );
    }
  );
});

router.get("/table", auth, (req, res) => {
  db.query(
    "SELECT *, gb.points / 3 AS groupsBets FROM users u LEFT JOIN (SELECT userId, points FROM groups_bets) gb ON u.id = gb.userId WHERE u.id != 0 ORDER BY u.points DESC, u.perfectBets DESC, u.goodBets DESC;",
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send("Nie znaleziono użytkowników");
      }
      return res.send(results);
    }
  );
});
router.get("/all", auth, async (req, res) => {
  db.query(
    "SELECT username, id FROM users u WHERE u.id != 0 ORDER BY username;",
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send("Nie znaleziono użytkowników");
      }

      return res.send(results);
    }
  );
});

module.exports = router;
