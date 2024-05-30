const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { decryptPass } = require("../utils/bcrypt");
const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");

const mailer = require("../utils/mailer");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT `id`,`password` FROM `users`  WHERE `username`=?;",
    [username],
    async (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length > 0) {
        const userId = results[0].id;
        if (await decryptPass(password, results[0].password)) {
          const token = await jwt.createToken({ id: userId }, "3h");
          res.setHeader("Authorization", token);
          res.send({ id: userId, token: token });
        } else {
          res.status(400).send("Incorrect password");
        }
      } else {
        res.status(400).send("User with this username doesn't exist");
      }
    }
  );
});
router.post("/setPassword", async (req, res) => {
  console.log("here");
  const password = await bcrypt.encryptPass(req.body.password);
  const auth = req.body.auth;
  const username = await jwt.verifyToken(auth);
  // console.log("useraneme " + username);

  db.query(
    "UPDATE `users` SET `password`= ?  WHERE `username`=?;",
    [password, username],
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.affectedRows > 0) {
        res.status(200).send("Password has been saved");
      }
    }
  );
});
router.post("/add", async (req, res) => {
  const token = req.cookies.token;
  const { username, email } = req.body;
  if (await jwt.verifyToken(token)) {
    db.query(
      "INSERT INTO `users` (`username`,`email`) VALUES (?,?)",
      [username, email],
      async (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          const auth = await jwt.createToken(username, "72h");
          res.status(200).send("User added correctly");
          mailer.sendMail(email, username, auth);
        }
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/table", (req, res) => {
  db.query(
    "SELECT * FROM users u WHERE u.id !=0 ORDER BY points DESC, perfectBets DESC, goodBets DESC;",
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Users not found");
        return;
      }
      // console.log(results);
      res.send(results);
      // console.log(results[0]);
      // res.json(results[0]);
    }
  );
  // console.log(req.body);
});

module.exports = router;
