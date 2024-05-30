const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/add", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { userId, matchId, score } = req.body;
    db.query(
      "INSERT INTO bets(`userId`,`matchId`,`betScore`) VALUES (?,?,?)",
      [userId, matchId, score],

      (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          res.status(200).send("Bet added succesfully");
        }

        // res.json(results[0]);
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get(`/:userId`, (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  db.query("SELECT * FROM bets WHERE `userId`=?", userId, (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length === 0) {
      res.send([]);
      return;
    }
    console.log(results);
    res.send(results);
    // res.json(results[0]);
  });
});

module.exports = router;
