const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("../utils/jwt");
router.post("/add", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { userId, matchId, score } = req.body;
    console.log(userId);
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
router.post("/topscorer", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { player, position, country, userId } = req.body;
    console.log(userId);
    db.query(
      "INSERT INTO topscorer_bets(`userId`,`player`,`country`,`position`) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE player = VALUES(player), country=VALUES(country), position=VALUES(position);",
      [userId, player, country, position],

      (err, results) => {
        console.log(results);
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          console.log("here");
          res.status(200).send("Bet added succesfully");
        }

        // res.json(results[0]);
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});
router.post("/winners", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { first, second, third, userId } = req.body;
    const winners = first + "," + second + "," + third;
    console.log(userId);
    db.query(
      "INSERT INTO winners_bets(`userId`,`bet`) VALUES (?,?) ON DUPLICATE KEY UPDATE bet = VALUES(bet);",
      [userId, winners],

      (err, results) => {
        console.log(results);
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          console.log("here");
          res.status(200).send("Bet added succesfully");
        }

        // res.json(results[0]);
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});
router.get("/topscorer/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  db.query(
    "SELECT `player`,`position`,`country` FROM topscorer_bets WHERE `userId`=?",
    userId,
    (err, results) => {
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
    }
  );
});
router.get("/winners/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  db.query(
    "SELECT `bet` FROM winners_bets WHERE `userId`=?",
    userId,
    (err, results) => {
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
    }
  );
});

module.exports = router;
