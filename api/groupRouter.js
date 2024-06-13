const express = require("express");
const auth = require("../utils/auth");
const router = express.Router();
const db = require("../utils/db");

const operations = require("../utils/operations");

router.get("/all", auth, (req, res) => {
  db.query("SELECT * FROM groups", (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("Błąd wewnętrzny serwera");
    }
    if (results.length === 0) {
      return res.status(201).send("Nie znaleziono typu grup");
    }

    return res.send(results);
    // res.json(results[0]);
  });
});
router.post("/save", auth, async (req, res) => {
  const groups = req.body.groups;
  const id = req.body.userId;

  db.query(
    "INSERT INTO groups_bets (userId, A, B, C, D, E, F) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE A = VALUES(A), B=VALUES(B), C=VALUES(C), D=VALUES(D), E=VALUES(E), F=VALUES(F);",
    [
      id,
      groups[0].teams.join(","),
      groups[1].teams.join(","),
      groups[2].teams.join(","),
      groups[3].teams.join(","),
      groups[4].teams.join(","),
      groups[5].teams.join(","),
    ],
    async (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.affectedRows > 0) {
        if (parseInt(id) === 0) {
          const groups = await operations.updateGroupsPoints();
          if (groups) {
            operations.updatePoints();
          }
        }
        return res.status(200).send("Typ dodany poprawnie");
      } else {
        return res
          .status(400)
          .send("Bład! Rządanie nie wpłynęło na żadne wiersze");
      }

      // res.json(results[0]);
    }
  );

  return;
});
router.get("/:userId", auth, (req, res) => {
  const id = req.params.userId;

  db.query(
    "SELECT A,B,C,D,E,F FROM groups_bets WHERE userId=?",
    id,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);

        return res.status(500).send("Błąd wewnętrzny serwera");
      }
      if (results.length === 0) {
        return res.status(201).send("Nie znaleziono typu grup");
      }

      return res.send(results[0]);
      // res.json(results[0]);
    }
  );
});
module.exports = router;
