const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("../utils/bcrypt");
router.get("/", (req, res) => {
  res.send("bbbb");
});
router.post("/setPassword", async (req, res) => {
  console.log(req.body);
  const password = await bcrypt.encryptPass(req.body.password);
  const id = req.body.id;
  db.query(
    "UPDATE `users` SET `password`= ?  WHERE `id`=?",
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
router.post("/add", (req, res) => {
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
