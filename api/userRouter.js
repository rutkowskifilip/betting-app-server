const express = require("express");
const router = express.Router();
const db = require("../db");
const { decryptPass } = require("../utils/bcrypt");
const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");
router.get("/", (req, res) => {
  res.send("bbbb");
});
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
          const token = await jwt.createToken(
            { username: username, id: userId },
            "1h"
          );
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
  console.log(req.body);
  const password = await bcrypt.encryptPass(req.body.password);
  const id = req.body.id;
  db.query(
    "UPDATE `users` SET `password`= ?  WHERE `id`=?;",
    [password, id],
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
  if (await jwt.verifyToken(token)) {
    db.query(
      "INSERT INTO `users` (`username`,`email`) VALUES (?,?)",
      [req.body.username, req.body.email],
      (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          res.status(200).send("User added correctly");
        }
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/table", (req, res) => {
  db.query(
    "SELECT u.username, b.betScore, m.score FROM users u LEFT JOIN bets b ON u.id = b.userId LEFT JOIN matches m ON b.matchId = m.id;",
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
      console.log(results);
      res.send(results);
      // console.log(results[0]);
      // res.json(results[0]);
    }
  );
  // console.log(req.body);
});

module.exports = router;
