const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const jwt = require("../utils/jwt");
const operations = require("../utils/operations");
router.get("/", (req, res) => {
  res.send("bbbb");
});

router.get("/all", (req, res) => {
  db.query("SELECT * FROM matches ORDER BY date, time", (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("Matches not found");
      return;
    }

    res.send(results);
    // res.json(results[0]);
  });
});
router.get("/all/:userId", (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT matches.*, bets.betScore FROM matches LEFT JOIN bets ON matches.id = bets.matchId AND bets.userId = ? ORDER BY date, time",
    userId,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Matches not found");
        return;
      }

      res.send(results);
      // res.json(results[0]);
    }
  );
});
router.get("/unbet/:userId", (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT m.* FROM matches m LEFT JOIN bets b ON m.id = b.matchId AND b.userId = ? WHERE b.userId IS NULL ORDER BY date, time",
    userId,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length === 0) {
        res.status(201).send("Matches not found");
        return;
      }

      res.send(results);
      // res.json(results[0]);
    }
  );
});
router.post("/add", async (req, res) => {
  const { type, teamOne, teamTwo, time, date, location, weight } = req.body;
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    db.query(
      "INSERT INTO matches(`type`,`teamOne`,`teamTwo`, `time`,`date`,`location`, weight) VALUES (?,?,?,?,?,?,?)",
      [type, teamOne, teamTwo, time, date, location, weight],

      (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          res.status(200).send("Match added correctly");
        }

        // res.json(results[0]);
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});
router.post("/score", async (req, res) => {
  const token = req.cookies.token;
  console.log("aaa");
  if (await jwt.verifyToken(token)) {
    const { matchId, score } = req.body;

    db.query(
      "UPDATE matches SET score=? WHERE id=?",
      [score, matchId],

      (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          res.status(200).send("Score added succesfully");
        }

        // res.json(results[0]);
      }
    );

    operations.updateBetsPoints();
    operations.updatePoints();
  } else {
    res.status(401).send("Unauthorized");
  }
});
router.get("/noscore", async (req, res) => {
  db.query(
    "SELECT * FROM matches WHERE score IS NULL OR score = '' ORDER BY date, time",

    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Matches not found");
        return;
      }

      res.send(results);
    }
  );
});
module.exports = router;
