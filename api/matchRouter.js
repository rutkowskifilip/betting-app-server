const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const jwt = require("../utils/jwt");
const operations = require("../utils/operations");

router.get("/", (req, res) => {
  res.send("bbbb");
});

router.get("/all", async (req, res) => {
  const query = {
    text: "SELECT * FROM matches ORDER BY date, time",
  };

  try {
    const result = await db.query(query);
    if (result.rows.length === 0) {
      res.status(404).send("Matches not found");
      return;
    }
    res.send(result.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/all/:userId", async (req, res) => {
  const userId = req.params.userId;

  const query = {
    text: "SELECT matches.*, bets.betScore FROM matches LEFT JOIN bets ON matches.id = bets.matchId AND bets.userId = $1 ORDER BY date, time",
    values: [userId],
  };

  try {
    const result = await db.query(query);
    if (result.rows.length === 0) {
      res.status(404).send("Matches not found");
      return;
    }
    res.send(result.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/unbet/:userId", async (req, res) => {
  const userId = req.params.userId;

  const query = {
    text: "SELECT m.* FROM matches m LEFT JOIN bets b ON m.id = b.matchId AND b.userId = $1 WHERE b.userId IS NULL ORDER BY date, time",
    values: [userId],
  };

  try {
    const result = await db.query(query);
    if (result.rows.length === 0) {
      res.status(201).send([]);
      return;
    }
    res.send(result.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/add", async (req, res) => {
  const { type, teamOne, teamTwo, time, date, location, weight } = req.body;
  const token = req.cookies.token;

  if (await jwt.verifyToken(token)) {
    const query = {
      text: "INSERT INTO matches (type, teamOne, teamTwo, time, date, location, weight, score) VALUES ($1, $2, $3, $4, $5, $6, $7, '') RETURNING *",
      values: [type, teamOne, teamTwo, time, date, location, weight],
    };

    try {
      const result = await db.query(query);
      if (result.rows.length > 0) {
        res.status(200).send("Match added correctly");
      }
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.post("/score", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { matchId, score } = req.body;

    const query = {
      text: "UPDATE matches SET score = $1 WHERE id = $2",
      values: [score, matchId],
    };

    try {
      await db.query(query);
      res.status(200).send("Score added successfully");
      operations.updateBetsPoints();
      operations.updatePoints();
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/noscore", async (req, res) => {
  const query = {
    text: "SELECT * FROM matches WHERE score IS NULL OR score = '' ORDER BY date, time",
  };

  try {
    const result = await db.query(query);
    console.log(result.rows);
    if (result.rows.length === 0) {
      res.status(201).send("Matches not found");
      return;
    }
    res.send(result.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
