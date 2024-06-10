const express = require("express");
const auth = require("../utils/auth");
const router = express.Router();
const db = require("../utils/db");
const jwt = require("../utils/jwt");
const operations = require("../utils/operations");
router.post("/add", auth, async (req, res) => {
  const { userId, matchId, score } = req.body;

  db.query(
    "INSERT INTO bets(userId, matchId, betScore) VALUES (?,?,?)",
    [userId, matchId, score],

    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.affectedRows > 0) {
        return res.status(200).send("Typ dodany poprawnie");
      } else {
        return res
          .status(400)
          .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
      }
    }
  );
  operations.updateBetsPoints();
  operations.updatePoints();
  return;
});

router.get("/:userId", auth, async (req, res) => {
  const userId = req.params.userId;

  db.query("SELECT * FROM bets WHERE userId=?", userId, (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("Błąd wewnętrzny serwera");
    }
    if (results.length === 0) {
      return res.send([]);
    }

    return res.send(results);
  });
});
router.post("/topscorer", auth, async (req, res) => {
  const { player, position, country, userId } = req.body;

  db.query(
    "INSERT INTO topscorer_bets(userId,player,country,position) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE player = VALUES(player), country=VALUES(country), position=VALUES(position);",
    [userId, player, country, position],

    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.affectedRows > 0) {
        return res.status(200).send("Typ dodany poprawnie");
      } else {
        return res
          .status(400)
          .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
      }

      // res.json(results[0]);
    }
  );
  operations.updateTopScorerPoints();
  operations.updatePoints();
  return;
});

router.post("/winners", auth, async (req, res) => {
  const { first, second, userId } = req.body;

  db.query(
    "INSERT INTO winners_bets(userId, first, second) VALUES (?,?,?) ON DUPLICATE KEY UPDATE first = VALUES(first), second=VALUE(second);",
    [userId, first, second],

    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.affectedRows > 0) {
        return res.status(200).send("Typ dodany poprawnie");
      } else {
        return res
          .status(400)
          .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
      }
    }
  );
  operations.updateWinnersPoints();
  operations.updatePoints();
  return;
});

router.get("/topscorer/:userId", auth, async (req, res) => {
  const userId = req.params.userId;

  db.query(
    "SELECT player, position, country FROM topscorer_bets WHERE userId=?",
    userId,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send([]);
      }

      return res.send(results[0]);
    }
  );
});

router.get("/winners/:userId", auth, async (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT first,second FROM winners_bets WHERE userId=?",
    userId,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);

        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send([]);
      }

      return res.send(results);
    }
  );
});

module.exports = router;
