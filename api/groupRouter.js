const express = require("express");
const auth = require("../utils/auth");
const router = express.Router();
const db = require("../utils/db");

const operations = require("../utils/operations");

router.get("/all", auth, (req, res) => {
  db.query("SELECT * FROM groups", (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.length === 0) {
      return res.status(201).send("Groups not found");
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
    (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        return res.status(500).send("Internal Server Error");
      }
      if (results.affectedRows > 0) {
        return res.status(200).send("Groups order saved correctly");
      } else {
        return res
          .status(400)
          .send("Unexpected: Insert did not affect any rows");
      }

      // res.json(results[0]);
    }
  );
  operations.updateGroupsPoints();
  operations.updatePoints();
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

        return res.status(500).send("Internal Server Error");
      }
      if (results.length === 0) {
        res.status(201).send("Groups not found");
        return res.status(500).send("Internal Server Error");
      }

      return res.send(results[0]);
      // res.json(results[0]);
    }
  );
});
module.exports = router;
