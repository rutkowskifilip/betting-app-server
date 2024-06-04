const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const jwt = require("../utils/jwt");
const operations = require("../utils/operations");

router.get("/all", async (req, res) => {
  const query = {
    text: "SELECT * FROM groups",
  };

  try {
    const result = await db.query(query);
    if (result.rows.length === 0) {
      res.status(404).send("Groups not found");
      return;
    }
    res.send(result.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/save", async (req, res) => {
  const token = req.cookies.token;
  if (await jwt.verifyToken(token)) {
    const groups = req.body.groups;
    const id = req.body.userId;
    console.log(id);
    const query = {
      text: `INSERT INTO groups_bets (userid, A, B, C, D, E, F)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (userid) DO UPDATE
              SET A = $2, B = $3, C = $4, D = $5, E = $6, F = $7`,
      values: [
        id,
        groups[0].teams.join(","),
        groups[1].teams.join(","),
        groups[2].teams.join(","),
        groups[3].teams.join(","),
        groups[4].teams.join(","),
        groups[5].teams.join(","),
      ],
    };

    try {
      await db.query(query);
      res.status(200).send("Groups order saved correctly");
      operations.updateGroupsPoints();
      operations.updatePoints();
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/:userId", async (req, res) => {
  const id = req.params.userId;

  const query = {
    text: "SELECT A, B, C, D, E, F FROM groups_bets WHERE userId = $1",
    values: [id],
  };

  try {
    const result = await db.query(query);
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

module.exports = router;
