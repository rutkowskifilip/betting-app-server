const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const jwt = require("../utils/jwt");
const operations = require("../utils/operations");
router.post("/add", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { userId, matchId, score } = req.body;
    console.log(userId);
    try {
      const result = await db.query(
        "INSERT INTO bets(userId, matchId, betScore, points) VALUES ($1, $2, $3, 0)",
        [userId, matchId, score]
      );
      res.status(200).send("Bet added successfully");
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const result = await db.query("SELECT * FROM bets WHERE userId=$1", [
      userId,
    ]);
    res.send(result.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/topscorer", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { player, position, country, userId } = req.body;
    console.log(userId);
    try {
      const result = await db.query(
        "INSERT INTO topscorer_bets(userId,player,country,position) VALUES ($1, $2, $3, $4) ON CONFLICT (userId) DO UPDATE SET player = EXCLUDED.player, country = EXCLUDED.country, position = EXCLUDED.position",
        [userId, player, country, position]
      );
      res.status(200).send("Bet added successfully");
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
    operations.updateTopScorerPoints();
    operations.updatePoints();
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.post("/winners", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const { first, second, userId } = req.body;

    console.log(userId);
    try {
      const result = await db.query(
        "INSERT INTO winners_bets(userId, first, second) VALUES ($1, $2, $3) ON CONFLICT (userId) DO UPDATE SET first = EXCLUDED.first, second = EXCLUDED.second",
        [userId, first, second]
      );
      res.status(200).send("Bet added successfully");
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
    operations.updateWinnersPoints();
    operations.updatePoints();
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/topscorer/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const result = await db.query(
      "SELECT player, position, country FROM topscorer_bets WHERE userId=$1",
      [userId]
    );
    if (result.rows.length === 0) {
      res.status(201).send([]);
      return;
    }
    res.send(result.rows[0]);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/winners/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const result = await db.query(
      "SELECT first,second FROM winners_bets WHERE userId=$1",
      [userId]
    );
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

module.exports = router;
