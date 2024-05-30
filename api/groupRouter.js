const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const jwt = require("../utils/jwt");
const operations = require("../utils/operations");

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
    console.log(groups[0].teams);

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
    operations.updateGroupsPoints();
    operations.updatePoints();
  } else {
    res.status(401).send("Unauthorized");
  }
});
router.get("/:userId", (req, res) => {
  const id = req.params.userId;
  db.query(
    "SELECT A,B,C,D,E,F FROM groups_bets WHERE userId=?",
    id,
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      if (results.length === 0) {
        res.status(404).send("Groups not found");
        return;
      }

      res.send(results[0]);
      // res.json(results[0]);
    }
  );
});
module.exports = router;
