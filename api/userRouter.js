const express = require("express");
const router = express.Router();

const bcrypt = require("../utils/bcrypt");
const jwt = require("../utils/jwt");
const mailer = require("../utils/mailer");
const db = require("../utils/db");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const query = {
    text: "SELECT id, password FROM users WHERE username = $1",
    values: [username],
  };

  try {
    const result = await db.query(query);
    if (result.rows.length > 0) {
      const userId = result.rows[0].id;
      if (await bcrypt.decryptPass(password, result.rows[0].password)) {
        const token = await jwt.createToken({ id: userId }, "3h");
        res.setHeader("Authorization", token);
        res.send({ id: userId, token: token });
      } else {
        res.status(409).send("Incorrect password");
      }
    } else {
      res.status(409).send("User with this username doesn't exist");
    }
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/setPassword", async (req, res) => {
  const password = await bcrypt.encryptPass(req.body.password);
  const username = req.body.username;
  const auth = req.body.auth;
  const email = await jwt.verifyToken(auth);

  const query = {
    text: "SELECT * FROM users WHERE username = $1",
    values: [username],
  };

  try {
    const result = await db.query(query);
    if (result.rows.length > 0) {
      // Username already exists
      res
        .status(409)
        .send("Username already in use. Please choose a different one.");
      return;
    }

    const updateQuery = {
      text: "UPDATE users SET password = $1, username = $2 WHERE email = $3",
      values: [password, username, email],
    };

    try {
      await db.query(updateQuery);
      res.status(200).send("Password has been saved");
    } catch (err) {
      console.error("Error updating database:", err);
      res.status(500).send("Internal Server Error (Update failed)");
    }
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/add", async (req, res) => {
  const token = req.cookies.token;
  const email = req.body.email;

  if (await jwt.verifyToken(token)) {
    const query = {
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    };

    try {
      const result = await db.query(query);
      if (result.rows.length > 0) {
        // User with the same email already exists
        res
          .status(409)
          .send("Email address already in use. Please choose a different one.");
        return;
      }

      const insertQuery = {
        text: "INSERT INTO users (email) VALUES ($1) RETURNING *",
        values: [email],
      };

      try {
        const result = await db.query(insertQuery);
        const auth = await jwt.createToken(result.rows[0].email, "72h");
        res.status(201).send("User created successfully");
        mailer.sendMail(result.rows[0].email, auth);
      } catch (err) {
        console.error("Error inserting into database:", err);
        res.status(500).send("Internal Server Error (Insert failed)");
      }
    } catch (err) {
      console.error("Error querying database:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/table", async (req, res) => {
  const query = {
    text: "SELECT * FROM users u WHERE u.id != 1 ORDER BY points DESC, perfectBets DESC, goodBets DESC",
  };

  try {
    const result = await db.query(query);
    if (result.rows.length === 0) {
      res.status(404).send("Users not found");
      return;
    }
    res.send(result.rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
