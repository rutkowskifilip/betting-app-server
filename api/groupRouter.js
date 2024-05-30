const express = require("express");
const router = express.Router();
const db = require("../db");
router.get("/", (req, res) => {
  res.send("bbbb");
});

router.get("/all", (req, res) => {
  db.query("SELECT * FROM groups", (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("Groups not found");
      return;
    }

    res.send(results);
    // res.json(results[0]);
  });
});
router.post("/save", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const groups = req.body.groups;
    const id = req.body.id;

    order = "";
    groups.forEach((e, i) => {
      if (i === 0) {
        order += e.teams.join();
      } else {
        order += "," + e.teams.join();
      }
    });

    db.query(
      "INSERT INTO groups_bets (userId, bet) VALUES (?, ?) ON DUPLICATE KEY UPDATE bet = VALUES(bet);",
      [id, order],
      (err, results) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        if (results.affectedRows > 0) {
          res.status(200).send("Groups order saved correctly");
        }

        // res.json(results[0]);
      }
    );
  } else {
    res.status(401).send("Unauthorized");
  }
});
module.exports = router;
