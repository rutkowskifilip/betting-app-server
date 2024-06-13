const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const jwt = require("../utils/jwt");
const operations = require("../utils/operations");
const auth = require("../utils/auth");

router.get("/all", auth, (req, res) => {
  db.query("SELECT * FROM matches ORDER BY date, time", (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("Błąd wewnętrzny serwera");
    }
    if (results.length === 0) {
      return res.status(201).send("Nie znaleziono meczów");
    }

    return res.send(results);
    // res.json(results[0]);
  });
});

router.get("/all/:userId", auth, (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT matches.*, bets.betScore FROM matches LEFT JOIN bets ON matches.id = bets.matchId AND bets.userId = ? ORDER BY date, time",
    userId,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send("Nie znaleziono meczów");
      }
      return res.send(results);
      // res.json(results[0]);
    }
  );
});

router.get("/unbet/:userId", auth, (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT m.* FROM matches m LEFT JOIN bets b ON m.id = b.matchId AND b.userId = ? WHERE b.userId IS NULL ORDER BY date, time",
    userId,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send("Nie znaleziono meczów");
      }
      return res.send(results);
      // res.json(results[0]);
    }
  );
});

router.post("/add", auth, async (req, res) => {
  const { type, teamOne, teamTwo, time, date, location, weight } = req.body;

  db.query(
    "INSERT INTO matches(type,teamOne,teamTwo, time,date,location, weight) VALUES (?,?,?,?,?,?,?)",
    [type, teamOne, teamTwo, time, date, location, weight],

    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.affectedRows > 0) {
        return res.status(200).send("Mecz dodany poprawnie");
      } else {
        return res
          .status(400)
          .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
      }

      // res.json(results[0]);
    }
  );
});

router.post("/score", auth, async (req, res) => {
  const { matchId, score } = req.body;

  db.query(
    "UPDATE matches SET score=? WHERE id=?",
    [score, matchId],

    async (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.affectedRows > 0) {
        const bets = await operations.updateBetsPoints();
        if (bets) {
          await operations.updatePoints();
        }

        return res.status(200).send("Wynik dodany poprawnie");
      } else {
        return res
          .status(400)
          .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
      }

      // res.json(results[0]);
    }
  );
});

router.get("/noscore", auth, async (req, res) => {
  db.query(
    "SELECT * FROM matches WHERE score IS NULL OR score = '' ORDER BY date, time",

    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send("Nie znaleziono meczów");
      }

      return res.send(results);
    }
  );
});
module.exports = router;
